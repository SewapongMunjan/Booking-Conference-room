// backend/src/routes/notetakers.ts
import { Router } from "express";
import { prisma } from "../prisma";
import { auth, requireAdmin } from "../middleware/auth";
import {
  BookingStatus,
  InviteStatus,
  NoteQueueStatus,
  Prisma
} from "@prisma/client";

const router = Router();

/* ========== Utilities ========== */
function atDate(d: Date | string) {
  const x = new Date(d);
  return new Date(x.getFullYear(), x.getMonth(), x.getDate());
}

async function isNoteTakerBusy(
  tx: Prisma.TransactionClient | typeof prisma,
  userId: number,
  start: Date,
  end: Date,
  excludeBookingId?: number
) {
  const cnt = await tx.bookingNoteTaker.count({
    where: {
      userId,
      booking: {
        ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
        status: { not: BookingStatus.CANCELLED },
        OR: [
          { startTime: { gte: start, lt: end } },
          { endTime: { gt: start, lte: end } },
          { AND: [{ startTime: { lte: start } }, { endTime: { gte: end } }] },
        ],
      },
      status: { in: [NoteQueueStatus.ACCEPTED, NoteQueueStatus.INVITED] },
    },
  });
  return cnt > 0;
}

async function isOnLeaveDate(
  tx: Prisma.TransactionClient | typeof prisma,
  userId: number,
  date: Date
) {
  try {
    const cnt = await (tx as any).noteTakerLeave.count({
      where: { userId, date: atDate(date) as any },
    });
    return cnt > 0;
  } catch {
    return false;
  }
}

/* ========== Role Guards ========== */
// อนุญาต Admin / NoteManager / NoteTaker เข้าแดชบอร์ดนี้
async function requireNoteRole(req: any, res: any, next: any) {
  try {
    const meId = Number(req.user?.sub);
    if (!meId) return res.status(401).json({ error: "UNAUTH" });

    const me = await prisma.user.findUnique({
      where: { id: meId },
      select: {
        position: { select: { isAdmin: true, isNoteManager: true, isNoteTaker: true } },
      },
    });
    const p = me?.position;
    if (!(p?.isAdmin || p?.isNoteManager || p?.isNoteTaker)) {
      return res.status(403).json({ error: "FORBIDDEN" });
    }
    next();
  } catch (e) { next(e); }
}

// อนุญาตเฉพาะ Admin/NoteManager สำหรับงานจัดแทน (pending/substitute)
async function requireNoteManagerOrAdmin(req: any, res: any, next: any) {
  try {
    const meId = Number(req.user?.sub);
    if (!meId) return res.status(401).json({ error: "UNAUTH" });

    const me = await prisma.user.findUnique({
      where: { id: meId },
      select: {
        position: { select: { isAdmin: true, isNoteManager: true } },
      },
    });
    const p = me?.position;
    if (!(p?.isAdmin || p?.isNoteManager)) {
      return res.status(403).json({ error: "FORBIDDEN" });
    }
    next();
  } catch (e) { next(e); }
}

/* ========== คิวผู้จด ========== */
/** GET /api/notetakers/queue — ดูคิวปัจจุบัน (active) */
router.get("/queue", auth, requireNoteRole, async (_req, res) => {
  try {
    const rows = await prisma.noteTakerQueue.findMany({
      where: { isActive: true },
      orderBy: { orderNo: "asc" },
      select: {
        userId: true,
        orderNo: true,
        isActive: true,
        user: { select: { id: true, fullName: true, email: true } },
      },
    });
    res.json({ items: rows });
  } catch (e) {
    console.error("List note taker queue failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * POST /api/notetakers/rotate
 * body: { take?: number } — หมุนคิวบนสุดลงท้าย (admin only)
 */
router.post("/rotate", auth, requireAdmin, async (req, res) => {
  try {
    const take = Math.max(1, Math.min(10, Number(req.body?.take || 1)));

    const head = await prisma.noteTakerQueue.findMany({
      where: { isActive: true },
      orderBy: { orderNo: "asc" },
      take,
      select: { userId: true },
    });

    if (head.length === 0) return res.json({ ok: true, rotated: 0 });

    const maxOrder = await prisma.noteTakerQueue.aggregate({
      _max: { orderNo: true },
      where: { isActive: true },
    });

    let base = (maxOrder._max.orderNo || 0) + 1;

    await prisma.$transaction(
      head.map((n) =>
        prisma.noteTakerQueue.update({
          where: { userId: n.userId },
          data: { orderNo: base++ },
        })
      )
    );

    res.json({ ok: true, rotated: head.length });
  } catch (e) {
    console.error("Rotate note taker queue failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ========== งาน/การประชุม: ทั้งหมด/ช่วง/วันนี้ ========== */
/** GET /api/notetakers/assignments?withUsers=1&start=ISO&end=ISO */
router.get("/assignments", auth, requireNoteRole, async (req, res) => {
  try {
    // NOTE: เพื่อให้ชนิดเสถียร บังคับ include user เสมอ (ไม่ใช้ withUsers แล้ว)
    // คง parse parameter ไว้เผื่ออนาคต แต่ไม่ได้ใช้งานต่อ
    const _withUsers =
      req.query.withUsers === "1" || req.query.withUsers === "true";
    const start = req.query.start ? new Date(String(req.query.start)) : null;
    const end = req.query.end ? new Date(String(req.query.end)) : null;

    let whereTime: any = undefined;
    if (start && end) {
      whereTime = {
        OR: [
          { startTime: { gte: start, lt: end } },
          { endTime: { gt: start, lte: end } },
          { AND: [{ startTime: { lte: start } }, { endTime: { gte: end } }] },
        ],
      };
    }

    const list = await prisma.booking.findMany({
      where: {
        status: { not: BookingStatus.CANCELLED },
        ...(whereTime || {}),
      },
      orderBy: { startTime: "asc" },
      include: {
        room: true,
        // Always include user to keep type stable
        noteTakers: { include: { user: { select: { id: true, fullName: true } } } },
      },
    });

    const items = list.map((b) => {
      const unavailable = (b.noteTakers || [])
        .filter((nt) => nt.status !== NoteQueueStatus.ACCEPTED)
        .map((nt) => ({
          id: nt.user?.id ?? nt.userId,
          fullName: nt.user?.fullName ?? "(ไม่ทราบชื่อ)",
          status: nt.status,
        }));
      return {
        id: b.id,
        room: b.room,
        startTime: b.startTime,
        endTime: b.endTime,
        noteTakers: b.noteTakers,
        unavailableUsers: unavailable,
        needsReplacement: unavailable.length > 0,
      };
    });

    res.json({ items });
  } catch (e) {
    console.error("assignments failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ========== รายชื่อคนจดที่ “พร้อม” ให้เลือกแทน ==========
 * GET /api/notetakers/candidates?start=ISO&end=ISO&excludeIds=1,2
 */
router.get("/candidates", auth, requireNoteRole, async (req, res) => {
  try {
    const start = new Date(String(req.query.start));
    const end = new Date(String(req.query.end));
    if (isNaN(start as any) || isNaN(end as any)) {
      return res.status(400).json({ error: "BAD_TIME_RANGE" });
    }
    const excludeIds = String(req.query.excludeIds || "")
      .split(",")
      .map((x) => Number(x.trim()))
      .filter(Boolean);

    const q = await prisma.noteTakerQueue.findMany({
      where: { isActive: true, user: { position: { isNoteTaker: true } } },
      orderBy: { orderNo: "asc" },
      select: {
        userId: true,
        orderNo: true,
        user: { select: { id: true, fullName: true } },
      },
    });

    const day = atDate(start);
    const ready: any[] = [];
    for (const c of q) {
      if (excludeIds.includes(c.userId)) continue;
      if (await isOnLeaveDate(prisma, c.userId, day)) continue;
      if (await isNoteTakerBusy(prisma, c.userId, start, end)) continue;
      ready.push(c);
    }
    res.json({ items: ready });
  } catch (e) {
    console.error("candidates failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ========== ผู้จดกด “ลากะทันหัน/กลับมาว่าง” ==========
 * PATCH /api/notetakers/availability/unavailable { bookingId }
 * PATCH /api/notetakers/availability/available   { bookingId }
 */
router.patch("/availability/unavailable", auth, requireNoteRole, async (req: any, res) => {
  try {
    const meId = Number(req.user?.sub);
    const bookingId = Number(req.body?.bookingId);
    if (!bookingId) return res.status(400).json({ error: "BAD_INPUT" });

    const nt = await prisma.bookingNoteTaker.findFirst({ where: { bookingId, userId: meId } });
    if (!nt) return res.status(403).json({ error: "NOT_NOTE_TAKER" });

    await prisma.$transaction(async (tx) => {
      await tx.bookingNoteTaker.updateMany({
        where: { bookingId, userId: meId },
        data: { status: NoteQueueStatus.REPLACED },
      });
      await tx.bookingInvite.updateMany({
        where: { bookingId, userId: meId },
        data: { status: InviteStatus.DECLINED },
      });
    });

    res.json({ ok: true });
  } catch (e) {
    console.error("nt unavailable failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/availability/available", auth, requireNoteRole, async (req: any, res) => {
  try {
    const meId = Number(req.user?.sub);
    const bookingId = Number(req.body?.bookingId);
    if (!bookingId) return res.status(400).json({ error: "BAD_INPUT" });

    const nt = await prisma.bookingNoteTaker.findFirst({ where: { bookingId, userId: meId } });
    if (!nt) return res.status(403).json({ error: "NOT_NOTE_TAKER" });

    await prisma.$transaction(async (tx) => {
      await tx.bookingNoteTaker.updateMany({
        where: { bookingId, userId: meId },
        data: { status: NoteQueueStatus.ACCEPTED },
      });
      await tx.bookingInvite.updateMany({
        where: { bookingId, userId: meId },
        data: { status: InviteStatus.ACCEPTED },
      });
    });

    res.json({ ok: true });
  } catch (e) {
    console.error("nt available failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ========== ลางานรายวัน (พนักงานกดเอง) ==========
 * POST /api/notetakers/leave { date: 'YYYY-MM-DD', reason? }
 * DELETE /api/notetakers/leave?date=YYYY-MM-DD
 */
router.post("/leave", auth, requireNoteRole, async (req: any, res) => {
  try {
    const meId = Number(req.user?.sub);
    const dateStr = String(req.body?.date || "");
    const reason = (req.body?.reason as string | undefined) || null;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return res.status(400).json({ error: "BAD_DATE" });
    }
    const d = atDate(dateStr);

    await (prisma as any).noteTakerLeave.upsert({
      where: { userId_date: { userId: meId, date: d as any } },
      update: { reason: reason || undefined },
      create: { userId: meId, date: d as any, reason: reason || undefined },
    });

    res.json({ ok: true });
  } catch (e) {
    console.error("leave create failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/leave", auth, requireNoteRole, async (req: any, res) => {
  try {
    const meId = Number(req.user?.sub);
    const dateStr = String(req.query?.date || "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return res.status(400).json({ error: "BAD_DATE" });
    }
    const d = atDate(dateStr);

    await (prisma as any).noteTakerLeave.deleteMany({
      where: { userId: meId, date: d as any },
    });

    res.json({ ok: true });
  } catch (e) {
    console.error("leave delete failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ========== Pending: ใครลาช่วงประชุมไหน (ต้องหาคนแทน)
 * GET /api/notetakers/leaves/pending?date=YYYY-MM-DD
 * (เฉพาะ NoteManager/Admin)
 */
router.get("/leaves/pending", auth, requireNoteManagerOrAdmin, async (req, res) => {
  try {
    const dateStr = String(req.query?.date || "");
    const base = /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? atDate(dateStr) : atDate(new Date());
    const start = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 0, 0, 0);
    const end   = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 23, 59, 59);

    const leaves = await (prisma as any).noteTakerLeave.findMany({
      where: { date: start as any },
      select: { userId: true },
    });
    const leaveIds = new Set<number>(leaves.map((x: any) => x.userId));
    if (leaveIds.size === 0) return res.json({ items: [] });

    const bookings = await prisma.booking.findMany({
      where: {
        status: { not: BookingStatus.CANCELLED },
        OR: [
          { startTime: { gte: start, lt: end } },
          { endTime:   { gt: start,  lte: end } },
          { AND: [{ startTime: { lte: start } }, { endTime: { gte: end } }] },
        ],
      },
      orderBy: { startTime: "asc" },
      include: {
        room: true,
        noteTakers: { include: { user: { select: { id: true, fullName: true } } } },
      },
    });

    const items = bookings
      .map(b => {
        const affected = (b.noteTakers || []).filter(nt =>
          leaveIds.has(nt.userId) &&
          [NoteQueueStatus.ACCEPTED, NoteQueueStatus.INVITED].includes(nt.status as any)
        );
        const unavailableUsers = affected.map((nt) => ({
          id: nt.user?.id ?? nt.userId,
          fullName: nt.user?.fullName ?? "(ไม่ทราบชื่อ)",
          status: nt.status,
        }));
        const needsReplacement = unavailableUsers.length > 0;
        return needsReplacement ? {
          id: b.id,
          room: b.room,
          startTime: b.startTime,
          endTime: b.endTime,
          noteTakers: b.noteTakers,
          unavailableUsers,
          needsReplacement,
        } : null;
      })
      .filter(Boolean);

    res.json({ items });
  } catch (e) {
    console.error("leaves pending failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ========== เลือกคนแทน ==========
 * POST /api/notetakers/substitute  { bookingId, forUserId, substituteUserId }
 * (เฉพาะ NoteManager/Admin)
 */
router.post("/substitute", auth, requireNoteManagerOrAdmin, async (req, res) => {
  try {
    const bookingId        = Number(req.body?.bookingId);
    const forUserId        = Number(req.body?.forUserId);
    const substituteUserId = Number(req.body?.substituteUserId);
    if (!bookingId || !forUserId || !substituteUserId) {
      return res.status(400).json({ error: "BAD_INPUT" });
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ error: "BOOKING_NOT_FOUND" });

    const busy  = await isNoteTakerBusy(prisma, substituteUserId, booking.startTime, booking.endTime, bookingId);
    if (busy)   return res.status(409).json({ error: "CANDIDATE_BUSY" });
    const leave = await isOnLeaveDate(prisma, substituteUserId, atDate(booking.startTime));
    if (leave)  return res.status(409).json({ error: "CANDIDATE_ON_LEAVE" });

    await prisma.$transaction(async (tx) => {
      // คนเดิม -> REPLACED + DECLINED
      await tx.bookingNoteTaker.updateMany({
        where: { bookingId, userId: forUserId },
        data: { status: NoteQueueStatus.REPLACED },
      });
      await tx.bookingInvite.updateMany({
        where: { bookingId, userId: forUserId },
        data: { status: InviteStatus.DECLINED },
      });

      // คนแทน -> ACCEPTED + invite ACCEPTED
      const has = await tx.bookingNoteTaker.findFirst({
        where: { bookingId, userId: substituteUserId },
      });
      if (has) {
        await tx.bookingNoteTaker.update({
          where: { id: has.id },
          data: { status: NoteQueueStatus.ACCEPTED },
        });
      } else {
        const count = await tx.bookingNoteTaker.count({ where: { bookingId } });
        await tx.bookingNoteTaker.create({
          data: {
            bookingId,
            userId: substituteUserId,
            roleIndex: Math.min(count, 1), // 0/1
            status: NoteQueueStatus.ACCEPTED,
          },
        });
      }

      const inv = await tx.bookingInvite.findFirst({
        where: { bookingId, userId: substituteUserId },
      });
      if (inv) {
        await tx.bookingInvite.update({
          where: { id: inv.id },
          data: { status: InviteStatus.ACCEPTED },
        });
      } else {
        await tx.bookingInvite.create({
          data: { bookingId, userId: substituteUserId, status: InviteStatus.ACCEPTED },
        });
      }
    });

    res.json({ ok: true });
  } catch (e) {
    console.error("substitute failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// --- Leaves (ลาล่วงหน้า) ---
// ========== Leaves & Requests (ท้ายไฟล์) ==========

// ---------------- Types ----------------
type LeaveItem = {
  id: any;           // อนุญาต string/id ประกอบวัน
  date?: Date;
  from?: string;
  to?: string;
  reason?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  conflicts?: Array<{ bookingId: number; roomName: string }>;
};

type RequestItem = {
  id: number;
  start?: string;
  end?: string;
  targetUserId?: number;
  bookingId?: number;
};

// ---------------- Handlers ----------------
async function handleLeavesGet(req: any, res: any) {
  try {
    const meId = Number(req.user?.sub);
    if (!meId) return res.status(401).json({ error: "UNAUTH" });

    // ช่วงวันที่ (default: -60 ถึง +60 วันจากวันนี้)
    const today = new Date();
    const startStr = String(req.query.start || "");
    const endStr   = String(req.query.end   || "");
    const start = /^\d{4}-\d{2}-\d{2}$/.test(startStr)
      ? atDate(startStr)
      : new Date(today.getFullYear(), today.getMonth(), today.getDate() - 60);
    const end   = /^\d{4}-\d{2}-\d{2}$/.test(endStr)
      ? atDate(endStr)
      : new Date(today.getFullYear(), today.getMonth(), today.getDate() + 60);

    // ดึง leave รายวันของฉัน
    const rows = await (prisma as any).noteTakerLeave.findMany({
      where: { userId: meId, date: { gte: start as any, lte: end as any } },
      orderBy: { date: "desc" },
      select: { date: true, reason: true },
    });

    // ตรวจหางานที่ชนในวันนั้น ๆ
    const items: LeaveItem[] = [];
    for (const r of rows) {
      const d0 = new Date(r.date);
      const ds = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate(), 0, 0, 0);
      const de = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate(), 23, 59, 59);

      const conflicts = await prisma.booking.findMany({
        where: {
          status: { not: BookingStatus.CANCELLED },
          OR: [
            { startTime: { gte: ds, lt: de } },
            { endTime:   { gt: ds, lte: de } },
            { AND: [{ startTime: { lte: ds } }, { endTime: { gte: de } }] },
          ],
          noteTakers: {
            some: {
              userId: meId,
              status: { in: [NoteQueueStatus.ACCEPTED, NoteQueueStatus.INVITED] },
            },
          },
        },
        select: { id: true, room: { select: { roomName: true } } },
      });

      items.push({
        id: `L-${meId}-${r.date.toISOString().slice(0,10)}`,
        date: r.date,
        reason: r.reason,
        status: "APPROVED", // leave รายวันถือว่าอนุมัติด้วยตนเอง
        conflicts: conflicts.map(c => ({ bookingId: c.id, roomName: c.room?.roomName || "-" })),
      });
    }

    return res.json({
      items,
      pagination: { page: 1, pageSize: items.length, total: items.length },
    });
  } catch (e: any) {
    console.error("GET /leaves failed:", e);
    return res.status(500).json({ error: "Internal Server Error", message: e?.message });
  }
}

async function handleLeavesPost(req: any, res: any) {
  try {
    const meId = Number(req.user?.sub);
    if (!meId) return res.status(401).json({ error: "UNAUTH" });

    // หน้าเว็บส่ง { from, to, reason } -> แตกเป็นรายวัน บันทึกลง noteTakerLeave
    const { from, to, reason } = req.body as { from?: string; to?: string; reason?: string };
    if (!from) return res.status(400).json({ error: "BAD_DATE" });
    const s = atDate(from);
    const e = to ? atDate(to) : s;
    if (isNaN(s as any) || isNaN(e as any)) return res.status(400).json({ error: "BAD_DATE" });

    const created: string[] = [];
    await prisma.$transaction(async (tx) => {
      for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
        const day = atDate(d);
        await (tx as any).noteTakerLeave.upsert({
          where: { userId_date: { userId: meId, date: day as any } },
          update: { reason: reason || undefined },
          create: { userId: meId, date: day as any, reason: reason || undefined },
        });
        created.push(day.toISOString().slice(0,10));
      }
    });

    return res.json({ ok: true, created });
  } catch (e: any) {
    console.error("POST /leaves failed:", e);
    return res.status(500).json({ error: "Internal Server Error", message: e?.message });
  }
}

async function handleRequestsGet(_req: any, res: any) {
  try {
    // TODO: ดึงจาก DB จริง
    const items: RequestItem[] = [];
    return res.json({ items, total: items.length });
  } catch (e: any) {
    console.error("GET /requests failed:", e);
    return res.status(500).json({ error: "Internal Server Error", message: e?.message });
  }
}

async function handleRequestsPost(req: any, res: any) {
  try {
    // ✅ หน้าเว็บส่ง { start, end } (+ตัวเลือก targetUserId, bookingId)
    const { start, end, targetUserId, bookingId } = req.body as RequestItem;
    // TODO: บันทึกลง DB จริง
    const created: RequestItem = { id: Date.now(), start, end, targetUserId, bookingId };
    return res.json({ ok: true, item: created });
  } catch (e: any) {
    console.error("POST /requests failed:", e);
    return res.status(500).json({ error: "Internal Server Error", message: e?.message });
  }
}

// ---------------- New paths (ตาม mount /api/notetakers) ----------------
//
//  => /api/notetakers/leaves
router.get("/leaves", auth, handleLeavesGet);
router.post("/leaves", auth, handleLeavesPost);
//
//  => /api/notetakers/requests
router.get("/requests", auth, handleRequestsGet);
router.post("/requests", auth, handleRequestsPost);

// ---------------- Legacy alias (กัน 404 ถ้าฝั่งหน้าเรียกแบบเก่า) ----------------
//
//  => /api/notetakers/note-taker/requests  (เผื่อโค้ดเก่ายังเรียกอยู่)
router.get("/note-taker/requests", auth, handleRequestsGet);
router.post("/note-taker/requests", auth, handleRequestsPost);

/* ========== NEW: My View (สำหรับหน้า MyQueue) ==========
 * GET /api/notetakers/my-view?limit=5
 * คืน 3 กลุ่ม: ongoing (กำลังประชุม), upcoming (รับแล้ว-ยังไม่เริ่ม), invitations (ถูกเชิญ)
 */
router.get("/my-view", auth, requireNoteRole, async (req, res) => {
  try {
    const meId = Number(req.user?.sub);
    const limit = Math.min(Math.max(parseInt(String(req.query.limit || "5"), 10), 1), 20);
    const now = new Date();

    const where: Prisma.BookingWhereInput = {
      status: { not: BookingStatus.CANCELLED },
      noteTakers: { some: { userId: meId } },
    };

    const rows = await prisma.booking.findMany({
      where,
      orderBy: { startTime: "asc" },
      include: {
        room: { select: { id: true, roomName: true } },
        noteTakers: {
          where: { userId: meId },
          select: { status: true, userId: true },
        },
      },
    });

    const mapItem = (b: any) => ({
      id: b.id,
      roomName: b.room?.roomName ?? "-",
      startTime: b.startTime,
      endTime: b.endTime,
      myStatus: (b.noteTakers?.[0]?.status ?? null) as
        | "ACCEPTED" | "INVITED" | "DECLINED" | "REPLACED" | null,
    });

    const ongoing: any[] = [];
    const upcoming: any[] = [];
    const invitations: any[] = [];

    for (const b of rows) {
      const it = mapItem(b);
      const hasStarted = b.startTime <= now && now <= b.endTime;
      const future = b.startTime > now;

      if (it.myStatus === "ACCEPTED" && hasStarted) {
        ongoing.push(it);
      } else if (it.myStatus === "ACCEPTED" && future) {
        upcoming.push(it);
      } else if (it.myStatus === "INVITED" && future) {
        invitations.push(it);
      }
    }

    const byStart = (a: any, b: any) => +new Date(a.startTime) - +new Date(b.startTime);
    const sliceN = (arr: any[]) => arr.sort(byStart).slice(0, limit);

    res.json({
      ongoing: sliceN(ongoing),
      upcoming: sliceN(upcoming),
      invitations: sliceN(invitations),
    });
  } catch (e: any) {
    console.error("GET /api/notetakers/my-view failed:", e);
    res.status(500).json({ error: "Internal Server Error", message: e?.message });
  }
});

export default router;
