// backend/src/routes/housekeeping.ts
import { Router } from "express";
import {
  auth,
  requireHousekeeper,
  requireHousekeepingLead,
} from "../middleware/auth";
import { prisma } from "../prisma";
import {
  Prisma,
  ServiceCategory,
  ServiceStatus,
  NoteQueueStatus,
} from "@prisma/client";

const router = Router();

/* ========== helpers ========== */
function dayRange(d = new Date()) {
  const s = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const e = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  return { start: s, end: e };
}

const hkWhereBase: Prisma.BookingServiceWhereInput = {
  service: { category: ServiceCategory.HOUSEKEEPING },
  booking: { status: { not: "CANCELLED" as any } },
};

async function getAttendeeStats(bookingId: number) {
  const g = await prisma.bookingInvite.groupBy({
    by: ["status"],
    where: { bookingId },
    _count: { _all: true },
  });

  const invited  = g.find((x) => x.status === "INVITED")?._count._all ?? 0;
  const accepted = g.find((x) => x.status === "ACCEPTED")?._count._all ?? 0;
  const declined = g.find((x) => x.status === "DECLINED")?._count._all ?? 0;

  const noteTakers = await prisma.bookingNoteTaker.count({
    where: { bookingId, status: NoteQueueStatus.ACCEPTED },
  });

  const organizer = 1;
  const expected = accepted + noteTakers + organizer;
  return { invited, accepted, declined, noteTakers, organizer, expected };
}

/** สร้าง where จาก query */
function buildHKWhereFromQuery(query: any): Prisma.BookingServiceWhereInput {
  const where: Prisma.BookingServiceWhereInput = { ...hkWhereBase };

  const status = query?.status as ServiceStatus | undefined;
  if (status) where.status = status;

  const dateStr = query?.date as string | undefined;
  if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const d = new Date(dateStr);
    const { start, end } = dayRange(d);
    where.booking = {
      ...((where.booking as Prisma.BookingWhereInput) ?? {}),
      startTime: { gte: start, lte: end },
    };
  }

  return where;
}

/** ดึงรายการงาน HK พร้อมสรุปจำนวนคนที่คาดว่าจะมา */
async function fetchHKItems(where: Prisma.BookingServiceWhereInput) {
  const list = await prisma.bookingService.findMany({
    where,
    orderBy: [{ status: "asc" }, { id: "asc" }],
    include: {
      service: { select: { id: true, name: true, category: true } },
      booking: {
        select: {
          id: true,
          startTime: true,
          endTime: true,
          room: { select: { id: true, roomName: true } },
          bookedBy: { select: { id: true, fullName: true } },
        },
      },
    },
  });

  const items = await Promise.all(
    list.map(async (bs) => {
      const bookingId = bs.booking?.id!;
      const att = await getAttendeeStats(bookingId);
      const suggestedQuantity = bs.quantity ?? att.expected;
      return {
        id: bs.id,
        status: bs.status,
        serviceName: bs.service?.name ?? "-",
        bookingId,
        roomName: bs.booking?.room?.roomName ?? "-",
        startTime: bs.booking?.startTime,
        endTime: bs.booking?.endTime,
        requester: bs.booking?.bookedBy?.fullName ?? "",
        attendees: att,
        suggestedQuantity,
        quantity: bs.quantity ?? null,
      };
    })
  );

  return items;
}

/* ───────── Dashboard (แม่บ้านเห็นงานของตัวเอง/วันนี้) ───────── */
router.get("/dashboard", auth, requireHousekeeper, async (_req, res) => {
  const { start, end } = dayRange();

  const list = await prisma.bookingService.findMany({
    where: {
      ...hkWhereBase,
      booking: {
        startTime: { gte: start, lte: end },
        status: { not: "CANCELLED" as any },
      },
    },
    orderBy: [{ status: "asc" }, { id: "asc" }],
    include: {
      service: { select: { id: true, name: true } },
      booking: {
        select: {
          id: true,
          startTime: true,
          endTime: true,
          room: { select: { id: true, roomName: true } },
        },
      },
    },
  });

  const [pending, doing, done] = await Promise.all([
    prisma.bookingService.count({ where: { ...hkWhereBase, status: ServiceStatus.PENDING } }),
    prisma.bookingService.count({ where: { ...hkWhereBase, status: ServiceStatus.IN_PROGRESS } }),
    prisma.bookingService.count({ where: { ...hkWhereBase, status: ServiceStatus.COMPLETED } }),
  ]);

  const roomsToday = await prisma.booking.count({
    where: {
      status: { not: "CANCELLED" as any },
      startTime: { gte: start, lte: end },
    },
  });

  const items = await Promise.all(
    list.map(async (bs) => {
      const att = await getAttendeeStats(bs.booking!.id);
      const suggestedQuantity = bs.quantity ?? att.expected;
      return {
        id: bs.id,
        status: bs.status,
        serviceName: bs.service?.name ?? "-",
        bookingId: bs.booking!.id,
        roomName: bs.booking?.room?.roomName ?? "-",
        startTime: bs.booking?.startTime,
        endTime: bs.booking?.endTime,
        attendees: att,
        suggestedQuantity,
        quantity: bs.quantity ?? null,
      };
    })
  );

  res.json({
    summary: { roomsToday, pending, inProgress: doing, completed: done },
    items,
  });
});

/* ───────── Tasks (แม่บ้านทั่วไป) ───────── */
router.get("/tasks", auth, requireHousekeeper, async (req, res) => {
  const where = buildHKWhereFromQuery(req.query);
  const items = await fetchHKItems(where);
  res.json({ items });
});

/* ───────── Manage (หัวหน้าแม่บ้าน) ───────── */
router.get("/manage", auth, requireHousekeepingLead, async (req, res) => {
  const where = buildHKWhereFromQuery(req.query);
  const items = await fetchHKItems(where);
  res.json({ items });
});

/* ───────── Update status (เดิม) ───────── */
router.patch("/tasks/:id/status", auth, requireHousekeeper, async (req, res) => {
  const id = Number(req.params.id);
  const status = req.body?.status as ServiceStatus | undefined;
  if (!id || !status) return res.status(400).json({ error: "BAD_INPUT" });

  const updated = await prisma.bookingService.update({
    where: { id },
    data: { status },
  });
  res.json({ ok: true, item: updated });
});

/* ───────── Backward compatibility (FE เก่า) ───────── */
router.post("/update/:id", auth, requireHousekeeper, async (req, res) => {
  const id = Number(req.params.id);
  const raw = String(req.body?.status || "").toLowerCase();

  const map: Record<string, ServiceStatus> = {
    pending: ServiceStatus.PENDING,
    in_progress: ServiceStatus.IN_PROGRESS,
    doing: ServiceStatus.IN_PROGRESS,
    done: ServiceStatus.COMPLETED,
    completed: ServiceStatus.COMPLETED,
    rejected: ServiceStatus.REJECTED,
  };

  const status = map[raw];
  if (!id || !status) return res.status(400).json({ error: "BAD_INPUT" });

  const updated = await prisma.bookingService.update({
    where: { id },
    data: { status },
  });
  res.json({ ok: true, item: updated });
});

/* (option) Assign – โครงไว้สำหรับอนาคต */
router.patch("/tasks/:id/assign", auth, requireHousekeepingLead, async (req, res) => {
  const id = Number(req.params.id);
  const userId = Number(req.body?.userId);
  if (!id || !userId) return res.status(400).json({ error: "BAD_INPUT" });

  const item = await prisma.bookingService.update({
    where: { id },
    data: {
      // assignedToId: userId,
    },
  });
  res.json({ ok: true, item });
});

/* ──────────────────────────────────────────────────────────────
   ✅ ชุด API เฉพาะ “งานทำความสะอาดห้องประชุม”
   - แยกจาก Coffee/Lunch เด็ดขาด
   - ใช้ BookingService เฉพาะ service.name = "Cleaning"
   - ถ้ายังไม่มี record จะสร้างให้อัตโนมัติ (สถานะ PENDING)
   Endpoints:
     GET    /api/housekeeping/cleaning/bookings
     POST   /api/housekeeping/cleaning/bookings/:bookingId/start-cleaning
     POST   /api/housekeeping/cleaning/bookings/:bookingId/finish-cleaning
   ────────────────────────────────────────────────────────────── */

async function ensureCleaningService() {
  const rec = await prisma.service.upsert({
    where: { name: "Cleaning" },
    update: { category: ServiceCategory.HOUSEKEEPING },
    create: { name: "Cleaning", category: ServiceCategory.HOUSEKEEPING },
    select: { id: true, name: true },
  });
  return rec.id;
}

/** Map สถานะไปยังข้อความที่หน้า FE ใช้ */
function toCleaningStatus(s?: ServiceStatus | null) {
  if (s === ServiceStatus.IN_PROGRESS) return "RUNNING";
  if (s === ServiceStatus.COMPLETED)  return "COMPLETED";
  return "PENDING";
}

/** ดึง “ทุกห้องที่ถูกจอง” ทั้งอดีต/ปัจจุบัน/อนาคต */
router.get("/cleaning/bookings", auth, requireHousekeeper, async (_req, res) => {
  try {
    const cleaningServiceId = await ensureCleaningService();

    const bookings = await prisma.booking.findMany({
      where: { status: { not: "CANCELLED" as any } },
      orderBy: { startTime: "desc" },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        room: { select: { id: true, roomName: true } },
        bookedBy: { select: { id: true, fullName: true } },
      },
    });

    const items: any[] = [];
    for (const b of bookings) {
      let bs = await prisma.bookingService.findFirst({
        where: { bookingId: b.id, serviceId: cleaningServiceId },
        select: { id: true, status: true },
      });
      if (!bs) {
        bs = await prisma.bookingService.create({
          data: {
            bookingId: b.id,
            serviceId: cleaningServiceId,
            status: ServiceStatus.PENDING,
          },
          select: { id: true, status: true },
        });
      }
      items.push({
        bookingId: b.id,
        startTime: b.startTime,
        endTime: b.endTime,
        room: b.room ? { id: b.room.id, roomName: b.room.roomName ?? null } : null,
        bookedBy: b.bookedBy ? { id: b.bookedBy.id, fullName: b.bookedBy.fullName } : null,
        cleaningStatus: toCleaningStatus(bs.status),
        cleaningStartedAt: null,
        cleaningCompletedAt: null,
      });
    }

    res.json({ items });
  } catch (e) {
    console.error("GET /cleaning/bookings failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/** เริ่มทำความสะอาด */
router.post("/cleaning/bookings/:bookingId/start-cleaning", auth, requireHousekeeper, async (req, res) => {
  try {
    const bookingId = Number(req.params.bookingId);
    if (!bookingId) return res.status(400).json({ error: "BAD_INPUT" });

    const cleaningServiceId = await ensureCleaningService();

    const exists = await prisma.booking.findUnique({ where: { id: bookingId }, select: { id: true } });
    if (!exists) return res.status(404).json({ error: "BOOKING_NOT_FOUND" });

    const rec = await prisma.bookingService.upsert({
      where: {
        id: (await prisma.bookingService.findFirst({
          where: { bookingId, serviceId: cleaningServiceId },
          select: { id: true },
        }))?.id ?? 0,
      } as any,
      create: { bookingId, serviceId: cleaningServiceId, status: ServiceStatus.IN_PROGRESS },
      update: { status: ServiceStatus.IN_PROGRESS },
      select: { id: true, status: true },
    });

    res.json({ ok: true, status: toCleaningStatus(rec.status) });
  } catch (e) {
    console.error("POST /start-cleaning failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/** จบทำความสะอาด (และเปลี่ยนสถานะห้องเป็น AVAILABLE) */
router.post("/cleaning/bookings/:bookingId/finish-cleaning", auth, requireHousekeeper, async (req, res) => {
  try {
    const bookingId = Number(req.params.bookingId);
    if (!bookingId) return res.status(400).json({ error: "BAD_INPUT" });

    const cleaningServiceId = await ensureCleaningService();

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, roomId: true },
    });
    if (!booking) return res.status(404).json({ error: "BOOKING_NOT_FOUND" });

    const rec = await prisma.bookingService.upsert({
      where: {
        id: (await prisma.bookingService.findFirst({
          where: { bookingId, serviceId: cleaningServiceId },
          select: { id: true },
        }))?.id ?? 0,
      } as any,
      create: { bookingId, serviceId: cleaningServiceId, status: ServiceStatus.COMPLETED },
      update: { status: ServiceStatus.COMPLETED },
      select: { id: true, status: true },
    });

    if (booking.roomId) {
      await prisma.meetingRoom.update({
        where: { id: booking.roomId },
        data: { status: "AVAILABLE" as any },
      });
    }

    res.json({ ok: true, status: toCleaningStatus(rec.status) });
  } catch (e) {
    console.error("POST /finish-cleaning failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ───────── Assign booking แม่บ้าน (optional) ───────── */
router.post("/assign", auth, async (req, res) => {
  try {
    const bookingId = Number(req.body?.bookingId);
    const userId = Number(req.body?.userId);
    const actorId = (req as any).user?.id || (req as any).userId;

    if (!bookingId || !userId) {
      return res.status(400).json({ error: "BAD_REQUEST", message: "bookingId/userId required" });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true },
    });
    if (!booking) return res.status(404).json({ error: "BOOKING_NOT_FOUND" });

    const hk = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, position: { select: { isHousekeeper: true } } },
    });
    if (!hk || !hk.position?.isHousekeeper) {
      return res.status(400).json({ error: "USER_NOT_HOUSEKEEPER" });
    }

    const dup = await (prisma as any).housekeepingAssignment?.findFirst?.({
      where: { bookingId, userId },
      select: { id: true },
    });
    if (dup) {
      return res.status(409).json({ error: "ALREADY_ASSIGNED" });
    }

    const rec = await (prisma as any).housekeepingAssignment?.create?.({
      data: {
        bookingId,
        userId,
        assignedById: actorId ?? null,
      },
    });

    return res.json({ ok: true, assignment: rec ?? null });
  } catch (e) {
    console.error("housekeeping.assign failed:", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
