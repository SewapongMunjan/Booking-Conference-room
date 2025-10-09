// src/routes/bookings.ts
import { Router } from "express";
import { prisma } from "../prisma";
import { auth, requireAdmin } from "../middleware/auth";
import {
  BookingStatus,
  InviteStatus,
  ServiceStatus,
  NoteQueueStatus,
  Prisma
} from "@prisma/client";

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
        { startTime: { gte: start, lt: end } }, // เริ่มภายในช่วง
        { endTime: { gt: start, lte: end } },   // สิ้นสุดภายในช่วง
        { AND: [{ startTime: { lte: start } }, { endTime: { gte: end } }] }, // ครอบคลุมทั้งช่วง
      ],
    },
  });

  return overlapCount > 0;
}

/** helper: สร้างแจ้งเตือนให้หลายคน */
async function notifyMany(
  tx: Prisma.TransactionClient,
  userIds: number[],
  message: string
) {
  if (!userIds?.length) return;
  await tx.notification.createMany({
    data: userIds.map((uid) => ({ userId: uid, message })),
    skipDuplicates: true,
  });
}

/** ====== CREATE BOOKING ====== */
router.post("/", auth, async (req, res) => {
  try {
    const userId = req.user!.sub;
    const {
      roomId,
      startTime,
      endTime,
      agendaUrl, // เผื่ออนาคต (ยังไม่เก็บ DB)
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
      return res
        .status(400)
        .json({ error: "roomId, startTime, endTime are required" });
    }

    const s = new Date(startTime);
    const e = new Date(endTime);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) {
      return res.status(400).json({ error: "Invalid startTime or endTime" });
    }
    if (e <= s) {
      return res
        .status(400)
        .json({ error: "endTime must be later than startTime" });
    }

    const room = await prisma.meetingRoom.findUnique({
      where: { id: Number(roomId) },
    });
    if (!room) return res.status(404).json({ error: "Room not found" });

    if (await isRoomTimeBlocked(room.id, s, e)) {
      return res
        .status(409)
        .json({ error: "Room is not available in the selected time range" });
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

      // 4) invites: พนักงานทั้งหมดในตำแหน่งที่ถูกเลือก
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

          // 🔔 แจ้งเตือนผู้ถูกเชิญ
          await notifyMany(
            tx,
            attendees.map((a) => a.id),
            `คุณได้รับคำเชิญเข้าประชุม ห้อง ${room.roomName} เวลา ${s.toLocaleString()}`
          );
        }
      }

      // 5) เลือก NoteTaker 2 คนจากคิว (auto-accept) แล้วหมุนคิวไปท้าย
      const notetakers = await tx.noteTakerQueue.findMany({
        where: { isActive: true },
        orderBy: { orderNo: "asc" },
        take: 2,
        select: { userId: true, orderNo: true },
      });

      if (notetakers.length > 0) {
        // (A) บันทึกผู้จดประชุม (ACCEPTED)
        await tx.bookingNoteTaker.createMany({
          data: notetakers.map((n, idx) => ({
            bookingId: booking.id,
            userId: n.userId,
            roleIndex: idx, // 0,1
            status: NoteQueueStatus.ACCEPTED,
          })),
          skipDuplicates: true,
        });

        // (B) ทำให้มี invite ด้วยก็ set ACCEPTED ไปเลย
        await tx.bookingInvite.createMany({
          data: notetakers.map((n) => ({
            bookingId: booking.id,
            userId: n.userId,
            status: InviteStatus.ACCEPTED,
          })),
          skipDuplicates: true,
        });

        // 🔔 แจ้งผู้ถูกมอบหมายจดประชุม
        await notifyMany(
          tx,
          notetakers.map((n) => n.userId),
          `คุณถูกมอบหมายให้เป็นผู้จดประชุม ห้อง ${room.roomName} เวลา ${s.toLocaleString()}`
        );

        // (C) หมุนคิวไปท้าย
        const maxOrder = await tx.noteTakerQueue.aggregate({
          _max: { orderNo: true },
          where: { isActive: true },
        });
        let base = (maxOrder._max.orderNo || 0) + 1;

        for (const n of notetakers) {
          await tx.noteTakerQueue.update({
            where: { userId: n.userId },
            data: { orderNo: base++ },
          });
        }
      }

      return booking;
    });

    res.status(201).json({ booking: result });
  } catch (e) {
    console.error("Create booking failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/** ====== LIST BOOKINGS ======
 * GET /api/bookings?mine=1&status=APPROVED&status_not=CANCELLED&status_in=A,B&start=ISO&end=ISO&start_gte=ISO&roomId=1&withInviteStats=1&page=1&pageSize=20
 */
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user!.sub;

    // ---- Query parsing ----
    const mine = req.query.mine === "1" || req.query.mine === "true";
    const status = (req.query.status as string) || undefined;
    const status_not = (req.query.status_not as string) || undefined;                 // NEW
    const status_in = (req.query.status_in as string) || undefined;                   // NEW (comma-separated)
    const start = (req.query.start as string) || undefined;
    const end = (req.query.end as string) || undefined;
    const start_gte = (req.query.start_gte as string) || undefined;                   // NEW (สำหรับ recent)
    const withInviteStats =
      req.query.withInviteStats === "1" || req.query.withInviteStats === "true";
    const roomIdParam = req.query.roomId ? Number(req.query.roomId) : undefined;

    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt((req.query.pageSize as string) || "20", 10))
    );

    // ---- Build where ----
    const where: Prisma.BookingWhereInput = {};

    if (mine) where.bookedById = userId;
    if (roomIdParam) where.roomId = roomIdParam;

    // สถานะ: ตามลำดับความสำคัญ -> status > status_in > status_not > default(not CANCELLED)
    if (status) {
      where.status = status as BookingStatus;
    } else if (status_in) {
      const arr = status_in.split(",").map(s => s.trim()).filter(Boolean) as BookingStatus[];
      if (arr.length) where.status = { in: arr };
    } else if (status_not) {
      where.status = { not: status_not as BookingStatus };
    } else {
      // ค่าเริ่มต้น: ไม่คืน CANCELLED
      where.status = { not: BookingStatus.CANCELLED };
    }

    // เวลา:
    // 1) หากมี start & end -> overlap ช่วง
    // 2) หากมี start_gte อย่างเดียว -> startTime >= start_gte
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
    } else if (start_gte) {
      const s = new Date(start_gte);
      if (!isNaN(s.getTime())) {
        where.startTime = { gte: s };
      }
    }

    const orderBy =
      roomIdParam && (start || end)
        ? { startTime: "asc" as const }
        : { startTime: "desc" as const };

    const [items, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy,
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

    // รวมสรุปคำเชิญ (ถ้าขอมา)
    let statsMap: Record<number, { INVITED?: number; ACCEPTED?: number; DECLINED?: number }> = {};
    if (withInviteStats && items.length) {
      const ids = items.map((b) => b.id);
      const stats = await prisma.bookingInvite.groupBy({
        by: ["bookingId", "status"],
        where: { bookingId: { in: ids } },
        _count: { _all: true },
      });
      statsMap = stats.reduce((acc, row) => {
        const curr = acc[row.bookingId] || {};
        curr[row.status as "INVITED" | "ACCEPTED" | "DECLINED"] = row._count._all;
        acc[row.bookingId] = curr;
        return acc;
      }, {} as Record<number, any>);
    }

    const itemsWithStats = items.map((b) => ({
      ...b,
      inviteStats: statsMap[b.id] || undefined,
    }));

    res.json({ page, pageSize, total, items: itemsWithStats });
  } catch (e) {
    console.error("List bookings failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/** ====== MY BOOKINGS (shortcut) ======
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

/** ====== INVITE: ACCEPT ======
 * POST /api/bookings/:id/confirm
 */
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

    // แจ้งผู้จองว่ามีคนยืนยัน
    const b = await prisma.booking.findUnique({
      where: { id },
      include: { room: true, bookedBy: { select: { id: true } } },
    });
    if (b) {
      await prisma.notification.create({
        data: {
          userId: b.bookedBy.id,
          message: `มีการยืนยันเข้าร่วมประชุม ห้อง ${b.room?.roomName ?? "-"} เวลา ${b.startTime.toLocaleString()}`,
        },
      });
    }

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

    const invite = await prisma.bookingInvite.findFirst({
      where: { bookingId: id, userId },
    });
    if (!invite) return res.status(404).json({ error: "No invite for this user" });

    await prisma.bookingInvite.update({
      where: { id: invite.id },
      data: { status: InviteStatus.DECLINED },
    });

    // แจ้งผู้จองว่ามีคนปฏิเสธ
    const b = await prisma.booking.findUnique({
      where: { id },
      include: { room: true, bookedBy: { select: { id: true } } },
    });
    if (b) {
      await prisma.notification.create({
        data: {
          userId: b.bookedBy.id,
          message: `มีผู้ปฏิเสธเข้าร่วมประชุม ห้อง ${b.room?.roomName ?? "-"} เวลา ${b.startTime.toLocaleString()}`,
        },
      });
    }

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
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        room: true,
        bookedBy: { select: { id: true } },
        invites: { select: { userId: true } },
        noteTakers: { select: { userId: true } },
      },
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // ตรวจชนเวลาโดยไม่นับตัวเอง
    if (
      await isRoomTimeBlocked(
        booking.roomId,
        booking.startTime,
        booking.endTime,
        booking.id
      )
    ) {
      return res
        .status(409)
        .json({ error: "Room time conflict at approval time" });
    }

    const approved = await prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.APPROVED },
    });

    // 🔔 แจ้งผู้จอง + ผู้ถูกเชิญ + ผู้จดประชุม
    await prisma.notification.create({
      data: {
        userId: booking.bookedBy.id,
        message: `คำขอจองห้อง ${booking.room?.roomName ?? "-"} (${booking.startTime.toLocaleString()}) ได้รับการอนุมัติแล้ว`,
      },
    });
    await prisma.notification.createMany({
      data: [
        ...booking.invites.map((i) => ({
          userId: i.userId,
          message: `การประชุมห้อง ${booking.room?.roomName ?? "-"} (${booking.startTime.toLocaleString()}) ได้รับการอนุมัติแล้ว`,
        })),
        ...booking.noteTakers.map((n) => ({
          userId: n.userId,
          message: `การประชุมห้อง ${booking.room?.roomName ?? "-"} (${booking.startTime.toLocaleString()}) ได้รับการอนุมัติแล้ว`,
        })),
      ],
      skipDuplicates: true,
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
 * ผลพวง: เซ็ต Booking เป็น CANCELLED และ service ที่ค้างงาน → REJECTED
 */
router.patch("/:id/cancel", auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const me = req.user!; // { sub: number }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        room: true,
        bookedBy: { select: { id: true } },
        invites: { select: { userId: true } },
        noteTakers: { select: { userId: true } },
      },
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // ตรวจสิทธิ์: ดึง isAdmin ปัจจุบันจาก DB ให้ชัวร์
    const meRow = await prisma.user.findUnique({
      where: { id: me.sub },
      select: { position: { select: { isAdmin: true } } },
    });
    const iAmAdmin = !!meRow?.position?.isAdmin;

    if (booking.bookedById !== me.sub && !iAmAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (booking.status === BookingStatus.CANCELLED) {
      return res.json({ booking }); // ยกเลิกไปแล้ว
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

      // 🔔 แจ้งทุกคนว่าการประชุมถูกยกเลิก
      const audience = [
        booking.bookedBy.id,
        ...booking.invites.map((i) => i.userId),
        ...booking.noteTakers.map((n) => n.userId),
      ];
      await notifyMany(
        tx,
        Array.from(new Set(audience)),
        `การประชุมห้อง ${booking.room?.roomName ?? "-"} (${booking.startTime.toLocaleString()}) ถูกยกเลิกแล้ว`
      );

      return b;
    });

    res.json({ booking: result });
  } catch (e) {
    console.error("Cancel booking failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
