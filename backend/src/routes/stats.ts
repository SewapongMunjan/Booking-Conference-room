// backend/src/routes/stats.ts
import { Router } from "express";
import { prisma } from "../prisma";
import { BookingStatus } from "@prisma/client";

const router = Router();

/** ---------- Utilities: เวลาไทย (UTC+7) ---------- */
function startOfDayLocal(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfDayLocal(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}
function makeLocalDate(y: number, m: number, d: number) {
  return new Date(y, m, d);
}

type Range = { from: Date; to: Date };

/** พาร์สช่วงเวลา (รองรับหลาย params) ถ้าไม่ส่ง => วันนี้ */
function parseRangeFromQuery(q: any): Range {
  const date = q.date || q.on;
  const from = q.from || q.start_gte;
  const to = q.to || q.end_lte;
  const dateFrom = q.dateFrom;
  const dateTo = q.dateTo;

  // 1) ส่ง date เดียว (YYYY-MM-DD)
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split("-").map(Number);
    const s = startOfDayLocal(makeLocalDate(y, (m || 1) - 1, d || 1));
    const e = endOfDayLocal(s);
    return { from: s, to: e };
  }

  // 2) ส่ง dateFrom/dateTo (YYYY-MM-DD)
  if (
    typeof dateFrom === "string" &&
    typeof dateTo === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(dateFrom) &&
    /^\d{4}-\d{2}-\d{2}$/.test(dateTo)
  ) {
    const [y1, m1, d1] = dateFrom.split("-").map(Number);
    const [y2, m2, d2] = dateTo.split("-").map(Number);
    const s = startOfDayLocal(makeLocalDate(y1, (m1 || 1) - 1, d1 || 1));
    const e = endOfDayLocal(makeLocalDate(y2, (m2 || 1) - 1, d2 || 1));
    return { from: s, to: e };
  }

  // 3) ส่ง from/to เป็น ISO
  if (typeof from === "string" && typeof to === "string") {
    const s = new Date(from);
    const e = new Date(to);
    if (!isNaN(s.getTime()) && !isNaN(e.getTime())) return { from: s, to: e };
  }

  // 4) ไม่ส่งอะไรมาเลย => วันนี้
  const now = new Date();
  return { from: startOfDayLocal(now), to: endOfDayLocal(now) };
}

/** where ของ Prisma ตามช่วงเวลา (รองรับหลายชื่อฟิลด์ของสคีมา) */
function timeWhere(range: Range) {
  // ใช้ as any เพื่อให้รองรับสคีมาที่ใช้ชื่อฟิลด์ต่างกัน (startTime/endTime, startAt/endAt, dateStart/dateEnd)
  const w: any = {
    OR: [
      { AND: [{ startTime: { lt: range.to } }, { endTime: { gt: range.from } }] },
      { AND: [{ startAt: { lt: range.to } }, { endAt: { gt: range.from } }] },
      { AND: [{ dateStart: { lt: range.to } }, { dateEnd: { gt: range.from } }] },
    ],
  };
  return w;
}

/** --------- คำนวณสถิติ --------- */
const approvedSet = new Set(["APPROVED", "CONFIRMED", "ACCEPTED"]);
const pendingSet = new Set([
  "PENDING",
  "REQUESTED",
  "AWAITING",
  "AWAITING_ATTENDEE_CONFIRM",
]);

async function buildStats(range: Range) {
  const where = timeWhere(range);

  const [total, groups] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.groupBy({
      by: ["status"],
      _count: { status: true },
      where,
    }),
  ]);

  const byStatus: Record<string, number> = {};
  for (const g of groups) {
    byStatus[String(g.status)] = g._count.status;
  }

  let approved = 0;
  let pending = 0;
  for (const [st, n] of Object.entries(byStatus)) {
    if (approvedSet.has(st)) approved += n;
    if (pendingSet.has(st)) pending += n;
  }

  const cancelled =
    byStatus[String(BookingStatus.CANCELLED)] ??
    byStatus["CANCELLED"] ??
    0;

  return {
    range: {
      from: range.from.toISOString(),
      to: range.to.toISOString(),
    },
    total,            // รวมทั้งหมดในช่วง
    totalToday: total, // alias เผื่อฝั่งหน้าใช้ชื่อนี้
    approved,
    pending,
    cancelled,
    byStatus,
  };
}

/** --------- Handlers --------- */

// /api/bookings/stats
router.get("/bookings/stats", async (req, res) => {
  try {
    const data = await buildStats(parseRangeFromQuery(req.query));
    res.json(data);
  } catch (e) {
    console.error("GET /bookings/stats failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// /api/bookings/summary (ให้ผลลัพธ์เดียวกัน)
router.get("/bookings/summary", async (req, res) => {
  try {
    const data = await buildStats(parseRangeFromQuery(req.query));
    res.json(data);
  } catch (e) {
    console.error("GET /bookings/summary failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// /api/stats  และ  /api/stats/bookings
router.get("/stats", async (req, res) => {
  try {
    const data = await buildStats(parseRangeFromQuery(req.query));
    res.json(data);
  } catch (e) {
    console.error("GET /stats failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/stats/bookings", async (req, res) => {
  try {
    const data = await buildStats(parseRangeFromQuery(req.query));
    res.json(data);
  } catch (e) {
    console.error("GET /stats/bookings failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// เผื่ออยากเรียกง่ายๆ สำหรับวันนี้เสมอ
router.get("/stats/today", async (_req, res) => {
  try {
    const now = new Date();
    const data = await buildStats({ from: startOfDayLocal(now), to: endOfDayLocal(now) });
    res.json(data);
  } catch (e) {
    console.error("GET /stats/today failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
