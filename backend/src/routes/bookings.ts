import { Router } from "express";
import { prisma } from "../prisma";
import { auth, requireAdmin } from "../middleware/auth";
import { BookingStatus, InviteStatus, ServiceStatus } from "@prisma/client";

const router = Router();

/** ตรวจชนเวลาห้อง */
async function isRoomTimeBlocked(roomId: number, start: Date, end: Date) {
  const blockingStatuses: BookingStatus[] = [
    BookingStatus.AWAITING_ATTENDEE_CONFIRM,
    BookingStatus.AWAITING_ADMIN_APPROVAL,
    BookingStatus.APPROVED,
  ];

  const overlapCount = await prisma.booking.count({
    where: {
      roomId,
      status: { in: blockingStatuses },
      OR: [
        { startTime: { gte: start, lt: end } },
        { endTime: { gt: start, lte: end } },
        { AND: [{ startTime: { lte: start } }, { endTime: { gte: end } }] },
      ],
    },
  });

  return overlapCount > 0;
}

/**
 * POST /api/bookings
 * body:
 * {
 *   "roomId": number,
 *   "startTime": ISOString,
 *   "endTime": ISOString,
 *   "agendaUrl"?: string,             // ✅ รับได้ แต่จะไม่บันทึก (สคีมาคุณไม่มีฟิลด์นี้)
 *   "requiredPositionIds": number[],
 *   "serviceIds": number[]
 * }
 */
router.post("/", auth, async (req, res) => {
  try {
    const userId = req.user!.sub;
    const {
      roomId,
      startTime,
      endTime,
      agendaUrl, // eslint-disable-line @typescript-eslint/no-unused-vars
      requiredPositionIds = [],
      serviceIds = [],
    } = req.body as {
      roomId: number;
      startTime: string;
      endTime: string;
      agendaUrl?: string;
      requiredPositionIds?: number[];
      serviceIds?: number[];
    };

    if (!roomId || !startTime || !endTime) {
      return res.status(400).json({ error: "roomId, startTime, endTime are required" });
    }

    const s = new Date(startTime);
    const e = new Date(endTime);
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || s >= e) {
      return res.status(400).json({ error: "Invalid startTime/endTime" });
    }

    const room = await prisma.meetingRoom.findUnique({ where: { id: Number(roomId) } });
    if (!room) return res.status(404).json({ error: "Room not found" });

    if (await isRoomTimeBlocked(room.id, s, e)) {
      return res.status(409).json({ error: "Room is not available in the selected time range" });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1) สร้าง booking (ไม่มี title/agendaUrl/approvedAt ในสคีมาคุณ)
      const booking = await tx.booking.create({
        data: {
          roomId: room.id,
          bookedById: userId,
          startTime: s,
          endTime: e,
          status: BookingStatus.AWAITING_ATTENDEE_CONFIRM,
        },
      });

      // 2) required positions
      if (requiredPositionIds.length > 0) {
        await tx.bookingRequiredPosition.createMany({
          data: requiredPositionIds.map((pid) => ({
            bookingId: booking.id,
            positionId: Number(pid),
          })),
          skipDuplicates: true,
        });
      }

      // 3) services (ใช้ ServiceStatus.PENDING)
      if (serviceIds.length > 0) {
        await tx.bookingService.createMany({
          data: serviceIds.map((sid) => ({
            bookingId: booking.id,
            serviceId: Number(sid),
            status: ServiceStatus.PENDING,
          })),
          skipDuplicates: true,
        });
      }

      // 4) เชิญผู้ที่อยู่ในตำแหน่งที่เลือกทั้งหมด → สถานะเชิญแรกคือ INVITED
      if (requiredPositionIds.length > 0) {
        const attendees = await tx.user.findMany({
          where: { positionId: { in: requiredPositionIds.map(Number) } },
          select: { id: true },
        });

        if (attendees.length > 0) {
          await tx.bookingInvite.createMany({
            data: attendees.map((u) => ({
              bookingId: booking.id,
              userId: u.id,
              status: InviteStatus.INVITED,
            })),
            skipDuplicates: true,
          });
        }
      }

      // 5) เลือก NoteTaker 2 คนจากคิว → ต้องใส่ roleIndex (0,1)
      const notetakers = await tx.noteTakerQueue.findMany({
        where: { isActive: true },
        orderBy: { orderNo: "asc" },
        take: 2,
        select: { userId: true },
      });

      if (notetakers.length > 0) {
        await tx.bookingNoteTaker.createMany({
          data: notetakers.map((n, idx) => ({
            bookingId: booking.id,
            userId: n.userId,
            roleIndex: idx, // 0,1
          })),
          skipDuplicates: true,
        });

        await tx.bookingInvite.createMany({
          data: notetakers.map((n) => ({
            bookingId: booking.id,
            userId: n.userId,
            status: InviteStatus.INVITED,
          })),
          skipDuplicates: true,
        });
      }

      return booking;
    });

    return res.status(201).json({ booking: result });
  } catch (e) {
    console.error("Create booking failed:", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/** GET /api/bookings/my — การจองของฉัน */
router.get("/my", auth, async (req, res) => {
  try {
    const userId = req.user!.sub;
    const items = await prisma.booking.findMany({
      where: { bookedById: userId },
      orderBy: { startTime: "desc" },
      include: {
        room: true,
        requiredPositions: { include: { position: true } }, // ✅ ชื่อ relation ตาม schema ของคุณ
        // ถ้าอยาก include บริการด้วย บอกชื่อ relation ที่แท้จริงมาได้ เช่น `services` หรือ `serviceRequests`
        invites: {
          include: { user: { select: { id: true, fullName: true } } },
        },
      },
    });
    res.json({ items });
  } catch (e) {
    console.error("Fetch my bookings failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/** GET /api/bookings/:id — รายละเอียดการจอง */
router.get("/:id", auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        room: true,
        bookedBy: { select: { id: true, fullName: true } },
        requiredPositions: { include: { position: true } },
        // include บริการไว้เมื่อรู้ชื่อ relation ที่ถูกต้อง
        invites: {
          include: {
            user: { select: { id: true, fullName: true, positionId: true } },
          },
        },
        noteTakers: {
          include: { user: { select: { id: true, fullName: true } } },
        },
      },
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json({ booking });
  } catch (e) {
    console.error("Get booking failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/** POST /api/bookings/:id/confirm — ผู้ใช้กดยืนยันเข้าประชุม */
router.post("/:id/confirm", auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user!.sub;

    const invite = await prisma.bookingInvite.findFirst({
      where: { bookingId: id, userId },
    });
    if (!invite) return res.status(404).json({ error: "No invite for this user" });

    await prisma.bookingInvite.update({
      where: { id: invite.id },
      data: { status: InviteStatus.ACCEPTED },
    });

    // ถ้าคำเชิญทั้งหมดไม่เหลือที่เป็น INVITED → เปลี่ยน booking เป็น AWAITING_ADMIN_APPROVAL
    const stillInvited = await prisma.bookingInvite.count({
      where: { bookingId: id, status: InviteStatus.INVITED },
    });
    if (stillInvited === 0) {
      await prisma.booking.update({
        where: { id },
        data: { status: BookingStatus.AWAITING_ADMIN_APPROVAL },
      });
    }

    res.json({ ok: true });
  } catch (e) {
    console.error("Confirm invite failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/** POST /api/bookings/:id/decline — ผู้ใช้ปฏิเสธเข้าประชุม */
router.post("/:id/decline", auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user!.sub;

    const invite = await prisma.bookingInvite.findFirst({
      where: { bookingId: id, userId },
    });
    if (!invite) return res.status(404).json({ error: "No invite for this user" });

    await prisma.bookingInvite.update({
      where: { id: invite.id },
      data: { status: InviteStatus.DECLINED },
    });

    res.json({ ok: true });
  } catch (e) {
    console.error("Decline invite failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/** POST /api/bookings/:id/approve — แอดมินอนุมัติ */
router.post("/:id/approve", auth, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (await isRoomTimeBlocked(booking.roomId, booking.startTime, booking.endTime)) {
      return res.status(409).json({ error: "Room time conflict at approval time" });
    }

    const approved = await prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.APPROVED },
    });

    res.json({ booking: approved });
  } catch (e) {
    console.error("Approve booking failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/** (ออปชัน) GET /api/bookings?start=...&end=... — ดูรายการจองตามช่วงเวลา */
router.get("/", auth, async (req, res) => {
  try {
    const { start, end } = req.query as { start?: string; end?: string };
    const whereTime =
      start && end
        ? {
            OR: [
              { startTime: { gte: new Date(start), lt: new Date(end) } },
              { endTime: { gt: new Date(start), lte: new Date(end) } },
              {
                AND: [
                  { startTime: { lte: new Date(start) } },
                  { endTime: { gte: new Date(end) } },
                ],
              },
            ],
          }
        : {};

    const items = await prisma.booking.findMany({
      where: { ...whereTime },
      orderBy: { startTime: "asc" },
      include: {
        room: true,
        bookedBy: { select: { id: true, fullName: true } },
      },
    });

    res.json({ items });
  } catch (e) {
    console.error("List bookings failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
