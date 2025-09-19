// src/routes/bookings.ts
import { Router } from "express";
import { prisma } from "../prisma";
import { auth, requireAdmin } from "../middleware/auth";
import { BookingStatus, InviteStatus, ServiceStatus } from "@prisma/client";

const router = Router();

/** ตรวจชนเวลาห้อง (มี option ข้าม bookingId เดิม เพื่อใช้ตอน approve) */
async function isRoomTimeBlocked(
  roomId: number,
  start: Date,
  end: Date,
  excludeBookingId?: number
) {
  const blockingStatuses: BookingStatus[] = [
    BookingStatus.AWAITING_ATTENDEE_CONFIRM,
    BookingStatus.AWAITING_ADMIN_APPROVAL,
    BookingStatus.APPROVED,
  ];

  const overlapCount = await prisma.booking.count({
    where: {
      roomId,
      status: { in: blockingStatuses },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
      OR: [
        { startTime: { gte: start, lt: end } },
        { endTime: { gt: start, lte: end } },
        { AND: [{ startTime: { lte: start } }, { endTime: { gte: end } }] },
      ],
    },
  });

  return overlapCount > 0;
}

/** ====== CREATE BOOKING ====== */
router.post("/", auth, async (req, res) => {
  try {
    const userId = req.user!.sub;
    const {
      roomId,
      startTime,
      endTime,
      agendaUrl, // สคีมาปัจจุบันยังไม่ได้บันทึก คงรับมาเฉย ๆ เผื่อใช้อนาคต
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
    if (isNaN(s.getTime()) || isNaN(e.getTime())) {
      return res.status(400).json({ error: "Invalid startTime or endTime" });
    }
    if (e <= s) {
      return res.status(400).json({ error: "endTime must be later than startTime" });
    }

    const room = await prisma.meetingRoom.findUnique({ where: { id: Number(roomId) } });
    if (!room) return res.status(404).json({ error: "Room not found" });

    if (await isRoomTimeBlocked(room.id, s, e)) {
      return res.status(409).json({ error: "Room is not available in the selected time range" });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1) booking
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

      // 3) services
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

      // 4) invites: ผู้ที่อยู่ในตำแหน่งที่เลือกทั้งหมด
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

      // 5) note taker 2 คนจากคิว
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

    res.status(201).json({ booking: result });
  } catch (e) {
    console.error("Create booking failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/** ====== LIST BOOKINGS (ยืดหยุ่น) ======
 * GET /api/bookings?mine=1&status=APPROVED&start=ISO&end=ISO&page=1&pageSize=20
 */
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user!.sub;
    const mine = req.query.mine === "1" || req.query.mine === "true";
    const status = (req.query.status as string) || undefined;
    const start = (req.query.start as string) || undefined;
    const end = (req.query.end as string) || undefined;

    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const pageSize = Math.min(50, Math.max(1, parseInt((req.query.pageSize as string) || "20", 10)));

    const where: any = {};
    if (mine) where.bookedById = userId;
    if (status) where.status = status as BookingStatus;

    // filter ช่วงเวลา (optional)
    if (start && end) {
      const s = new Date(start);
      const e = new Date(end);
      if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
        where.OR = [
          { startTime: { gte: s, lt: e } },
          { endTime: { gt: s, lte: e } },
          { AND: [{ startTime: { lte: s } }, { endTime: { gte: e } }] },
        ];
      }
    }

    const [items, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { startTime: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          startTime: true,
          endTime: true,
          status: true,
          createdAt: true,
          room: { select: { id: true, roomName: true, capacity: true } },
          bookedBy: { select: { id: true, fullName: true } },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({ page, pageSize, total, items });
  } catch (e) {
    console.error("List bookings failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/** ====== MY BOOKINGS (ช็อตคัต) ======
 * GET /api/bookings/my
 */
router.get("/my", auth, async (req, res) => {
  try {
    const userId = req.user!.sub;
    const items = await prisma.booking.findMany({
      where: { bookedById: userId },
      orderBy: { startTime: "desc" },
      include: {
        room: true,
        requiredPositions: { include: { position: true } },
        invites: { include: { user: { select: { id: true, fullName: true } } } },
      },
    });
    res.json({ items });
  } catch (e) {
    console.error("Fetch my bookings failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/** ====== GET DETAIL ======
 * GET /api/bookings/:id
 */
router.get("/:id", auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        room: true,
        bookedBy: { select: { id: true, fullName: true } },
        requiredPositions: { include: { position: true } },
        invites: {
          include: { user: { select: { id: true, fullName: true, positionId: true } } },
        },
        noteTakers: { include: { user: { select: { id: true, fullName: true } } } },
        // ถ้ามี relation บริการ เช่น bookingServices: { include: { service: true } },
      },
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json({ booking });
  } catch (e) {
    console.error("Get booking failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/** ====== INVITE: ACCEPT ======
 * POST /api/bookings/:id/confirm
 */
router.post("/:id/confirm", auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user!.sub;

    const invite = await prisma.bookingInvite.findFirst({ where: { bookingId: id, userId } });
    if (!invite) return res.status(404).json({ error: "No invite for this user" });

    await prisma.bookingInvite.update({
      where: { id: invite.id },
      data: { status: InviteStatus.ACCEPTED },
    });

    // ถ้าไม่มีใครค้าง INVITED → เปลี่ยนเป็น AWAITING_ADMIN_APPROVAL
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

/** ====== INVITE: DECLINE ======
 * POST /api/bookings/:id/decline
 */
router.post("/:id/decline", auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user!.sub;

    const invite = await prisma.bookingInvite.findFirst({ where: { bookingId: id, userId } });
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

/** ====== ADMIN: APPROVE ======
 * POST /api/bookings/:id/approve
 */
router.post("/:id/approve", auth, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // ตรวจชนเวลาโดยไม่นับตัวเอง
    if (await isRoomTimeBlocked(booking.roomId, booking.startTime, booking.endTime, booking.id)) {
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

/** ====== CANCEL BOOKING ======
 * PATCH /api/bookings/:id/cancel
 * เงื่อนไข: ผู้จองเอง หรือ admin
 * ผลพวง: เซ็ต Booking เป็น CANCELLED และเซอร์วิสที่ยังไม่ดำเนินการ → REJECTED
 */
router.patch("/:id/cancel", auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const me = req.user!; // { sub: number, ... }

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // === ดึงสิทธิ์ admin ของผู้ที่ยิงคำขอ ณ จุดนี้ ===
    const meRow = await prisma.user.findUnique({
      where: { id: me.sub },
      select: { position: { select: { isAdmin: true } } },
    });
    const isAdmin = !!meRow?.position?.isAdmin;

    // สิทธิ์: ผู้จอง หรือ admin
    if (booking.bookedById !== req.user!.sub && !req.user!.pos?.isAdmin) {
  return res.status(403).json({ error: "Forbidden" });
}

    if (booking.status === BookingStatus.CANCELLED) {
      return res.json({ booking }); // ยกเลิกไปแล้ว ไม่ต้องทำซ้ำ
    }

    const result = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id },
        data: { status: BookingStatus.CANCELLED },
      });

      await tx.bookingService.updateMany({
        where: {
          bookingId: id,
          status: { in: [ServiceStatus.PENDING, ServiceStatus.IN_PROGRESS] },
        },
        data: { status: ServiceStatus.REJECTED },
      });

      return b;
    });

    res.json({ booking: result });
  } catch (e) {
    console.error("Cancel booking failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


export default router;
