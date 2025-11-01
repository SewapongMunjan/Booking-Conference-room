// src/routes/bookings.ts
import { Router } from "express";
import { prisma } from "../prisma";
import { auth, requireAdmin } from "../middleware/auth";
import {
  BookingStatus,
  InviteStatus,
  ServiceStatus,
  NoteQueueStatus,
  Prisma,
  NotifType,
  RefType,
} from "@prisma/client";

/** ---------- Utilities ---------- */
function renderBookingHtml(data: any): string {
  const attendeesHtml =
    (data.attendees || [])
      .map(
        (a: any) =>
          `<li>${a.name ?? "Unknown"}${a.email ? ` &lt;${a.email}&gt;` : ""}</li>`
      )
      .join("") || "<li>No attendees</li>";

  const start = data.dateStart ? new Date(data.dateStart).toLocaleString() : "-";
  const end = data.dateEnd ? new Date(data.dateEnd).toLocaleString() : "-";

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${data.code ?? "Booking"}</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; padding: 20px; }
          h1 { font-size: 18px; margin-bottom: 8px; }
          .meta { margin-bottom: 12px; }
        </style>
      </head>
      <body>
        <h1>Booking: ${data.code ?? "-"}</h1>
        <div class="meta">
          <div><strong>Room:</strong> ${data.roomName ?? "-"}</div>
          <div><strong>Organizer:</strong> ${data.organizer ?? "-"}</div>
          <div><strong>Time:</strong> ${start} - ${end}</div>
        </div>
        <div>
          <strong>Attendees</strong>
          <ul>${attendeesHtml}</ul>
        </div>
        <div>
          <strong>Agenda</strong>
          <p>${(data.agenda ?? "").replace(/\n/g, "<br/>")}</p>
        </div>
      </body>
    </html>
  `;
}

async function htmlToPdfBuffer(html: string, _opts?: any): Promise<Buffer> {
  // NOTE: ตัวอย่าง mock; ถ้ามี lib สร้าง PDF จริง ให้แทนที่ส่วนนี้
  return Buffer.from(html, "utf-8");
}

/** ตรวจว่า req.params.id เป็น "เลขล้วน" ไม่ใช่ NaN/undefined/คำอื่น ๆ */
function parseNumericIdParam(req: any, res: any): number | null {
  const raw = req.params?.id;
  if (!raw || !/^\d+$/.test(String(raw))) {
    res.status(400).json({ error: "Invalid or missing booking ID" });
    return null;
  }
  return Number(raw);
}

/** ========= Thai time helpers (UTC+7) =========
 * Thailand ไม่มี DST → ใช้ offset คงที่ +07:00 ได้ปลอดภัย
 */
const TH_OFFSET = "+07:00";

/** สร้าง Date จากสตริงที่ตีความเป็นเวลาไทย แล้วแปลงเป็น UTC Instant */
function dateFromThaiLocal(isoLocalLike: string): Date | null {
  if (!isoLocalLike) return null;
  // รับได้ทั้ง "YYYY-MM-DD" หรือ "YYYY-MM-DDTHH:mm[:ss]"
  // ถ้าให้มาแค่วันที่ → เติมเวลา 00:00
  const hasTime = isoLocalLike.includes("T");
  const base = hasTime ? isoLocalLike : `${isoLocalLike}T00:00:00`;
  // เติม offset +07:00 ให้เป็น RFC3339
  const withOffset = `${base}${TH_OFFSET}`;
  const d = new Date(withOffset);
  return isNaN(d.getTime()) ? null : d;
}

/** start ของทั้งวันไทย (00:00 ไทย) ในรูป UTC Instant */
function startOfThaiDay(dateStr: string): Date | null {
  return dateFromThaiLocal(`${dateStr}T00:00:00`);
}

/** end ของทั้งวันไทย (ถนัดใช้แบบ nextDayStart - 1ms) */
function endOfThaiDayExclusive(dateStr: string): Date | null {
  const next = dateFromThaiLocal(`${dateStr}T00:00:00`);
  if (!next) return null;
  // next day start (ไทย)
  const js = new Date(next.getTime() + 24 * 60 * 60 * 1000);
  return js;
}

const router = Router();

/** (Debug) Logger — เอาไว้วิเคราะห์ว่า endpoint ไหนโดนเรียก */
router.use((req, _res, next) => {
  console.log("[BOOKINGS]", req.method, req.originalUrl);
  next();
});

/** ===== Helper: ตรวจชนเวลาห้อง (มี option ข้าม bookingId เดิม เพื่อใช้ตอน approve) */
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

/** ===== Helper: แปลงช่วงเวลาให้อ่านง่าย */
function fmtRange(start: Date, end: Date) {
  const s = new Date(start);
  const e = new Date(end);
  return `${s.toLocaleString()} - ${e.toLocaleString()}`;
}

/** ===== Helper: สร้าง payload Notification ให้ครบฟิลด์ */
function makeNotif(input: {
  userId: number;
  message: string;
  type?: NotifType;
  title?: string;
  refType?: RefType;
  refId?: number | null;
}) {
  return {
    userId: input.userId,
    message: input.message,
    type: input.type ?? NotifType.INVITE,
    title: input.title ?? "Notification",
    refType: input.refType,
    refId: input.refId ?? null,
  };
}

/** ===== Helper: สร้างแจ้งเตือนให้หลายคนแบบ createMany */
async function notifyMany(
  tx: Prisma.TransactionClient,
  userIds: number[],
  payload: {
    message: string;
    type?: NotifType;
    title?: string;
    refType?: RefType;
    refId?: number | null;
  }
) {
  if (!userIds?.length) return;
  await tx.notification.createMany({
    data: userIds.map((uid) =>
      makeNotif({
        userId: uid,
        message: payload.message,
        type: payload.type,
        title: payload.title,
        refType: payload.refType,
        refId: payload.refId ?? null,
      })
    ),
    skipDuplicates: true,
  });
}

/** ====== CREATE BOOKING ====== */
router.post("/", auth, async (req: any, res) => {
  try {
    const userId = Number(req.user!.sub);
    const {
      roomId,
      startTime,
      endTime,
      agendaUrl,
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

    const created = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          roomId: room.id,
          bookedById: userId,
          startTime: s,
          endTime: e,
          status: BookingStatus.AWAITING_ATTENDEE_CONFIRM,
        },
      });

      if (requiredPositionIds.length > 0) {
        await tx.bookingRequiredPosition.createMany({
          data: requiredPositionIds.map((pid) => ({
            bookingId: booking.id,
            positionId: Number(pid),
          })),
          skipDuplicates: true,
        });
      }

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

          await notifyMany(tx, attendees.map((a) => a.id), {
            type: NotifType.INVITE,
            title: "เชิญเข้าร่วมการประชุม",
            message: `คุณได้รับคำเชิญเข้าประชุม ห้อง ${room.roomName} (${fmtRange(s, e)})`,
            refType: RefType.BOOKING,
            refId: booking.id,
          });
        }
      }

      const notetakers = await tx.noteTakerQueue.findMany({
        where: { isActive: true },
        orderBy: { orderNo: "asc" },
        take: 2,
        select: { userId: true, orderNo: true },
      });

      if (notetakers.length > 0) {
        await tx.bookingNoteTaker.createMany({
          data: notetakers.map((n, idx) => ({
            bookingId: booking.id,
            userId: n.userId,
            roleIndex: idx, // 0,1
            status: NoteQueueStatus.ACCEPTED,
          })),
          skipDuplicates: true,
        });

        await tx.bookingInvite.createMany({
          data: notetakers.map((n) => ({
            bookingId: booking.id,
            userId: n.userId,
            status: InviteStatus.ACCEPTED,
          })),
          skipDuplicates: true,
        });

        await notifyMany(tx, notetakers.map((n) => n.userId), {
          type: NotifType.INVITE,
          title: "มอบหมายให้จดประชุม",
          message: `คุณถูกมอบหมายให้เป็นผู้จดประชุม ห้อง ${room.roomName} (${fmtRange(s, e)})`,
          refType: RefType.BOOKING,
          refId: booking.id,
        });

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

    const full = await prisma.booking.findUnique({
      where: { id: created.id },
      include: {
        room: true,
        bookedBy: { select: { id: true, fullName: true } },
        requiredPositions: { include: { position: true } },
        invites: { include: { user: { select: { id: true, fullName: true } } } },
        noteTakers: { include: { user: { select: { id: true, fullName: true } } } },
        services: { include: { service: true } },
      },
    });

    res.status(201).json({ booking: full });
  } catch (e) {
    console.error("Create booking failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/** ====== LIST BOOKINGS ======
 * GET /api/bookings
 * พารามิเตอร์ (เลือกใช้):
 * - มาตรฐาน: mine, status, status_not, status_in, start, end, start_gte, roomId, withInviteStats, page, pageSize
 * - แบบวันไทย (UTC+7): date_th=YYYY-MM-DD, from_th=YYYY-MM-DD, to_th=YYYY-MM-DD, start_gte_th=YYYY-MM-DD[THH:mm]
 */
router.get("/", auth, async (req: any, res) => {
  try {
    const userId = Number(req.user!.sub);

    // -------- พารามิเตอร์เดิม --------
    const mine = req.query.mine === "1" || req.query.mine === "true";
    const status = (req.query.status as string) || undefined;
    const status_not = (req.query.status_not as string) || undefined;
    const status_in = (req.query.status_in as string) || undefined;
    const start = (req.query.start as string) || undefined;
    const end = (req.query.end as string) || undefined;
    const start_gte = (req.query.start_gte as string) || undefined;
    const roomIdParam = req.query.roomId ? Number(req.query.roomId) : undefined;
    const withInviteStats =
      req.query.withInviteStats === "1" || req.query.withInviteStats === "true";

    // -------- พารามิเตอร์วันไทย (ใหม่) --------
    const date_th = (req.query.date_th as string) || undefined;          // ทั้งวันไทย
    const from_th = (req.query.from_th as string) || undefined;          // ช่วงวันไทย (เริ่ม)
    const to_th   = (req.query.to_th as string) || undefined;            // ช่วงวันไทย (จบ) — exclusive (วันถัดไป 00:00 ไทย)
    const start_gte_th = (req.query.start_gte_th as string) || undefined;// เริ่มไม่ก่อนเวลานี้ (ไทย)

    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt((req.query.pageSize as string) || "20", 10))
    );

    const where: Prisma.BookingWhereInput = {};

    if (mine) where.bookedById = userId;
    if (roomIdParam) where.roomId = roomIdParam;

    // สถานะ
    if (status) {
      where.status = status as BookingStatus;
    } else if (status_in) {
      const arr = status_in
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean) as BookingStatus[];
      if (arr.length) where.status = { in: arr };
    } else if (status_not) {
      where.status = { not: status_not as BookingStatus };
    } else {
      // ค่าเริ่มต้น: ไม่คืน CANCELLED
      where.status = { not: BookingStatus.CANCELLED };
    }

    // ====== กฎเวลา (ให้ priority กับแบบไทยก่อน) ======
    // 1) date_th → ทั้งวันไทย
    if (date_th) {
      const s = startOfThaiDay(date_th);
      const e = endOfThaiDayExclusive(date_th);
      if (s && e) {
        where.OR = [
          { startTime: { gte: s, lt: e } },
          { endTime: { gt: s, lte: e } },
          { AND: [{ startTime: { lte: s } }, { endTime: { gte: e } }] },
        ];
      }
    }
    // 2) from_th + to_th → ช่วงวันไทย (to_th เป็นวันสุดท้ายแบบ exclusive)
    else if (from_th && to_th) {
      const s = startOfThaiDay(from_th);
      const e = startOfThaiDay(to_th); // to_th 00:00 ไทย → exclusive
      if (s && e) {
        where.OR = [
          { startTime: { gte: s, lt: e } },
          { endTime: { gt: s, lte: e } },
          { AND: [{ startTime: { lte: s } }, { endTime: { gte: e } }] },
        ];
      }
    }
    // 3) start_gte_th (ไทย) → startTime >= เวลานี้ (ไทย)
    else if (start_gte_th) {
      const s = dateFromThaiLocal(start_gte_th);
      if (s) {
        where.startTime = { gte: s };
      }
    }
    // 4) กฎมาตรฐานเดิม
    else if (start && end) {
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
      roomIdParam && (date_th || (from_th && to_th) || (start && end))
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
          bookedBy: { select: { id: true, fullName: true} },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    // รวมสรุปคำเชิญ (ถ้าขอมา)
    let statsMap: Record<
      number,
      { INVITED?: number; ACCEPTED?: number; DECLINED?: number }
    > = {};
    if (withInviteStats && items.length) {
      const ids = items.map((b) => b.id);
      const stats = await prisma.bookingInvite.groupBy({
        by: ["bookingId", "status"],
        where: { bookingId: { in: ids } },
        _count: { _all: true },
      });
      statsMap = stats.reduce((acc, row) => {
        const curr = acc[row.bookingId] || {};
        curr[row.status as "INVITED" | "ACCEPTED" | "DECLINED"] =
          row._count._all;
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
router.get("/my", auth, async (req: any, res) => {
  try {
    const userId = Number(req.user!.sub);
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

/** ====== INVITE: ACCEPT ======
 * POST /api/bookings/:id/confirm
 */
router.post("/:id/confirm", auth, async (req: any, res) => {
  try {
    const id = parseNumericIdParam(req, res);
    if (id === null) return;

    const userId = Number(req.user!.sub);

    const invite = await prisma.bookingInvite.findFirst({
      where: { bookingId: id, userId },
    });
    if (!invite)
      return res.status(404).json({ error: "No invite for this user" });

    await prisma.bookingInvite.update({
      where: { id: invite.id },
      data: { status: InviteStatus.ACCEPTED },
    });

    const b = await prisma.booking.findUnique({
      where: { id },
      include: { room: true, bookedBy: { select: { id: true } } },
    });
    if (b) {
      await prisma.notification.create({
        data: makeNotif({
          userId: b.bookedBy.id,
          type: NotifType.INVITE,
          title: "มีผู้ยืนยันเข้าร่วม",
          message: `มีการยืนยันเข้าร่วมประชุม ห้อง ${
            b.room?.roomName ?? "-"
          } (${b.startTime.toLocaleString()})`,
          refType: RefType.BOOKING,
          refId: b.id,
        }),
      });
    }

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
router.post("/:id/decline", auth, async (req: any, res) => {
  try {
    const id = parseNumericIdParam(req, res);
    if (id === null) return;

    const userId = Number(req.user!.sub);

    const invite = await prisma.bookingInvite.findFirst({
      where: { bookingId: id, userId },
    });
    if (!invite)
      return res.status(404).json({ error: "No invite for this user" });

    await prisma.bookingInvite.update({
      where: { id: invite.id },
      data: { status: InviteStatus.DECLINED },
    });

    const b = await prisma.booking.findUnique({
      where: { id },
      include: { room: true, bookedBy: { select: { id: true } } },
    });
    if (b) {
      await prisma.notification.create({
        data: makeNotif({
          userId: b.bookedBy.id,
          type: NotifType.INVITE,
          title: "มีผู้ปฏิเสธเข้าร่วม",
          message: `มีผู้ปฏิเสธเข้าร่วมประชุม ห้อง ${
            b.room?.roomName ?? "-"
          } (${b.startTime.toLocaleString()})`,
          refType: RefType.BOOKING,
          refId: b.id,
        }),
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
router.post("/:id/approve", auth, requireAdmin, async (req: any, res) => {
  try {
    const id = parseNumericIdParam(req, res);
    if (id === null) return;

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

    const title = "การจองได้รับการอนุมัติ";
    const msg = `การประชุมห้อง ${booking.room?.roomName ?? "-"} (${booking.startTime.toLocaleString()}) ได้รับการอนุมัติแล้ว`;

    await prisma.notification.create({
      data: makeNotif({
        userId: booking.bookedBy.id,
        type: NotifType.APPROVED,
        title,
        message: msg,
        refType: RefType.BOOKING,
        refId: booking.id,
      }),
    });

    const audience = [
      ...booking.invites.map((i) => i.userId),
      ...booking.noteTakers.map((n) => n.userId),
    ];
    if (audience.length) {
      await prisma.notification.createMany({
        data: audience.map((uid) =>
          makeNotif({
            userId: uid,
            type: NotifType.APPROVED,
            title,
            message: msg,
            refType: RefType.BOOKING,
            refId: booking.id,
          })
        ),
        skipDuplicates: true,
      });
    }

    res.json({ booking: approved });
  } catch (e) {
    console.error("Approve booking failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/** ====== CANCEL BOOKING ======
 * PATCH /api/bookings/:id/cancel
 */
router.patch("/:id/cancel", auth, async (req: any, res) => {
  try {
    const id = parseNumericIdParam(req, res);
    if (id === null) return;

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

    const meRow = await prisma.user.findUnique({
      where: { id: me.sub },
      select: { position: { select: { isAdmin: true } } },
    });
    const iAmAdmin = !!meRow?.position?.isAdmin;

    if (booking.bookedById !== me.sub && !iAmAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (booking.status === BookingStatus.CANCELLED) {
      return res.json({ booking });
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

      const audience = Array.from(
        new Set([
          booking.bookedBy.id,
          ...booking.invites.map((i) => i.userId),
          ...booking.noteTakers.map((n) => n.userId),
        ])
      );

      await notifyMany(tx, audience, {
        type: NotifType.CANCELED,
        title: "การประชุมถูกยกเลิก",
        message: `การประชุมห้อง ${booking.room?.roomName ?? "-"} (${booking.startTime.toLocaleString()}) ถูกยกเลิกแล้ว`,
        refType: RefType.BOOKING,
        refId: booking.id,
      });

      return b;
    });

    res.json({ booking: result });
  } catch (e) {
    console.error("Cancel booking failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/** ====== EXPORT PDF ======
 * GET /api/bookings/:id/pdf
 */
router.get("/:id/pdf", auth, async (req, res) => {
  try {
    const id = parseNumericIdParam(req, res);
    if (id === null) return;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        room: { select: { id: true, roomName: true, capacity: true } },
        bookedBy: { select: { id: true, fullName: true, email: true } },
        invites: { include: { user: { select: { id: true, fullName: true, email: true } } } },
        noteTakers: { include: { user: { select: { id: true, fullName: true } } } },
      },
    });
    if (!booking) return res.status(404).json({ error: "not found" });

    const data = {
      code: `BK-${booking.id}`,
      roomName: booking.room?.roomName ?? "-",
      organizer: booking.bookedBy?.fullName ?? `user#${booking.bookedById}`,
      department: undefined,
      dateStart: booking.startTime,
      dateEnd: booking.endTime,
      attendees: (booking.invites ?? []).map((a: any) => ({
        name: a.user?.fullName ?? `user#${a.userId}`,
        email: a.user?.email ?? undefined,
      })),
      equipments: [],
      agenda: booking.purpose ?? "",
      notes: "",
    };

    const html = renderBookingHtml(data);
    const pdf = await htmlToPdfBuffer(html, {
      format: "A4",
      landscape: false,
      headerHtml: `
        <div style="font-size:12px;width:100%;padding:0 24px;display:flex;align-items:center;justify-content:space-between;">
          <div><b>แบบฟอร์มการจองห้องประชุม</b></div>
          <div>รหัส: ${data.code}</div>
        </div>
      `,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="booking-${data.code}.pdf"`);
    return res.send(pdf);
  } catch (err) {
    console.error("GET /api/bookings/:id/pdf error:", err);
    return res.status(500).json({ error: "internal server error" });
  }
});

/** ====== GET DETAIL (วางท้าย เพื่ออ่านง่าย + guard id ชัดเจน) ======
 * GET /api/bookings/:id
 */
router.get("/:id", auth, async (req: any, res) => {
  try {
    const id = parseNumericIdParam(req, res);
    if (id === null) return;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        room: true,
        bookedBy: { select: { id: true, fullName: true } },
        requiredPositions: { include: { position: true } },
        invites: { include: { user: { select: { id: true, fullName: true, positionId: true } } } },
        noteTakers: { include: { user: { select: { id: true, fullName: true } } } },
        services: { include: { service: { select: { id: true, name: true, category: true } } } },
      },
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json({ booking });
  } catch (e) {
    console.error("Get booking failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/** ====== UPDATE STATUS (PATCH /api/bookings/:id/status) ====== */
router.patch("/:id/status", auth, async (req: any, res) => {
  try {
    const id = parseNumericIdParam(req, res)
    if (id === null) return

    const me = req.user!

    // ยืดหยุ่น: อ่าน status จากหลายแหล่ง (body.status, body.desiredStatus, query.status)
    const raw =
      req.body?.status ??
      req.body?.desiredStatus ??
      req.body?.action ??
      req.query?.status ??
      ""
    const wanted = String(raw).toUpperCase().trim()

    // map case-insensitive -> actual enum value
    const allowed = Object.values(BookingStatus)
    const matched = allowed.find((s) => String(s).toUpperCase() === wanted)

    if (!matched) {
      return res.status(400).json({
        error: "Invalid status",
        provided: raw,
        allowed: allowed,
      })
    }
    const desired = matched as BookingStatus

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        room: true,
        bookedBy: { select: { id: true } },
        invites: { select: { userId: true } },
        noteTakers: { select: { userId: true } },
      },
    })
    if (!booking) return res.status(404).json({ error: "Booking not found" })

    const meRow = await prisma.user.findUnique({
      where: { id: me.sub },
      select: { position: { select: { isAdmin: true } } },
    })
    const iAmAdmin = !!meRow?.position?.isAdmin

    // permission rules
    if (desired === BookingStatus.APPROVED && !iAmAdmin) {
      return res.status(403).json({ error: "Forbidden" })
    }
    if (desired === BookingStatus.CANCELLED && booking.bookedById !== me.sub && !iAmAdmin) {
      return res.status(403).json({ error: "Forbidden" })
    }

    // check conflict before approving
    if (desired === BookingStatus.APPROVED) {
      if (
        await isRoomTimeBlocked(
          booking.roomId,
          booking.startTime,
          booking.endTime,
          booking.id
        )
      ) {
        return res.status(409).json({ error: "Room time conflict at approval time" })
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id },
        data: { status: desired },
      })

      // (existing notify/cascade logic for CANCELLED/APPROVED)
      if (desired === BookingStatus.CANCELLED) {
        await tx.bookingService.updateMany({
          where: {
            bookingId: id,
            status: { in: [ServiceStatus.PENDING, ServiceStatus.IN_PROGRESS] },
          },
          data: { status: ServiceStatus.REJECTED },
        })

        const audience = Array.from(
          new Set([
            booking.bookedBy.id,
            ...booking.invites.map((i) => i.userId),
            ...booking.noteTakers.map((n) => n.userId),
          ])
        )

        await notifyMany(tx, audience, {
          type: NotifType.CANCELED,
          title: "การประชุมถูกยกเลิก",
          message: `การประชุมห้อง ${booking.room?.roomName ?? "-"} (${fmtRange(
            booking.startTime,
            booking.endTime
          )}) ถูกยกเลิกแล้ว`,
          refType: RefType.BOOKING,
          refId: booking.id,
        })
      }

      if (desired === BookingStatus.APPROVED) {
        const title = "การจองได้รับการอนุมัติ"
        const msg = `การประชุมห้อง ${booking.room?.roomName ?? "-"} (${booking.startTime.toLocaleString()}) ได้รับการอนุมัติแล้ว`

        await tx.notification.create({
          data: makeNotif({
            userId: booking.bookedBy.id,
            type: NotifType.APPROVED,
            title,
            message: msg,
            refType: RefType.BOOKING,
            refId: booking.id,
          }),
        })

        const audience = [
          ...booking.invites.map((i) => i.userId),
          ...booking.noteTakers.map((n) => n.userId),
        ]
        if (audience.length) {
          await tx.notification.createMany({
            data: audience.map((uid) =>
              makeNotif({
                userId: uid,
                type: NotifType.APPROVED,
                title,
                message: msg,
                refType: RefType.BOOKING,
                refId: booking.id,
              })
            ),
            skipDuplicates: true,
          })
        }
      }

      return b
    })

    res.json({ booking: result })
  } catch (e) {
    console.error("Update booking status failed:", e)
    res.status(500).json({ error: "Internal Server Error" })
  }
})

/** ====== START (compat): POST /api/bookings/:id/start ====== */
router.post("/:id/start", auth, async (req: any, res) => {
  try {
    const id = parseNumericIdParam(req, res);
    if (id === null) return;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // no-op / compatibility: frontend expects 200 when note taker starts
    // หากต้องการเปลี่ยนสถานะจริง ให้อัปเดต booking.status ที่นี่
    return res.json({ ok: true, bookingId: id });
  } catch (err) {
    console.error("POST /:id/start error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/** ====== DONE (compat): POST /api/bookings/:id/done ====== */
router.post("/:id/done", auth, async (req: any, res) => {
  try {
    const id = parseNumericIdParam(req, res)
    if (id === null) return

    const booking = await prisma.booking.findUnique({ where: { id } })
    if (!booking) return res.status(404).json({ error: "Booking not found" })

    return res.json({ ok: true, booking })
  } catch (err) {
    console.error("POST /:id/done error:", err)
    return res.status(500).json({ error: "Internal Server Error" })
  }
})
export default router;
