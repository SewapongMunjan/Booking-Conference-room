// src/routes/housekeeping.ts
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
  InviteStatus,
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

  const invited =
    g.find((x) => x.status === "INVITED")?._count._all ?? 0;
  const accepted =
    g.find((x) => x.status === "ACCEPTED")?._count._all ?? 0;
  const declined =
    g.find((x) => x.status === "DECLINED")?._count._all ?? 0;

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
      service: { select: { id: true, name: true } },
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
  // ใช้ shared logic เดียวกับ /tasks (ห้ามเรียก router.handle ซ้อน!)
  const where = buildHKWhereFromQuery(req.query);
  const items = await fetchHKItems(where);
  res.json({ items });
});

/* ───────── Update status (ใหม่) ───────── */
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

/**
 * POST /api/housekeeping/assign
 * body: { bookingId: number, userId: number }
 */
router.post("/assign", auth, async (req, res) => {
  try {
    const bookingId = Number(req.body?.bookingId);
    const userId = Number(req.body?.userId);
    const actorId = (req as any).user?.id || (req as any).userId;

    if (!bookingId || !userId) {
      return res.status(400).json({ error: "BAD_REQUEST", message: "bookingId/userId required" });
    }

    // 1) booking ต้องมีอยู่
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, startTime: true, endTime: true }
    });
    if (!booking) return res.status(404).json({ error: "BOOKING_NOT_FOUND" });

    // 2) user ต้องเป็น “แม่บ้าน”
    const hk = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, position: { select: { isHousekeeper: true } } }
    });
    if (!hk || !hk.position?.isHousekeeper) {
      return res.status(400).json({ error: "USER_NOT_HOUSEKEEPER" });
    }

    // 3) กันซ้ำ (คนเดิมใน booking เดิม)
    const dup = await (prisma as any).housekeepingAssignment.findFirst({
      where: { bookingId, userId },
      select: { id: true }
    });
    if (dup) {
      return res.status(409).json({ error: "ALREADY_ASSIGNED" });
    }

    // 4) บันทึกมอบหมาย
    const rec = await (prisma as any).housekeepingAssignment.create({
      data: {
        bookingId,
        userId,
        assignedById: actorId ?? null
      }
    });

    return res.json({ ok: true, assignment: rec });
  } catch (e) {
    console.error("housekeeping.assign failed:", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
