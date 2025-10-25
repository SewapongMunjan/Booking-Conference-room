// backend/src/routes/rooms.ts
import { Router } from "express";
import { prisma } from "../prisma";
import { auth } from "../middleware/auth";
import { BookingStatus, RoomStatus } from "@prisma/client";

const router = Router();

/** แปะ label ภาษาไทยให้ enum RoomStatus */
function statusLabelTH(s?: RoomStatus) {
  if (s === RoomStatus.AVAILABLE) return "เปิดใช้งาน";
  if (s === RoomStatus.UNAVAILABLE) return "ปิดใช้งาน";
  return "-";
}

/** ถ้า all=1 (หรือ true) -> ดึงทุกห้อง, ถ้าไม่ใส่ -> ดึงเฉพาะ AVAILABLE */
function buildRoomStatusWhere(all?: string) {
  if (all === "1" || all === "true") return {};
  return { status: RoomStatus.AVAILABLE } as const;
}

/* ------------------------------------------------------------------ */
/* 1) รายการ “ห้องทั้งหมด” + สถานะห้อง (ค่าเริ่มต้น: เฉพาะ AVAILABLE)     */
/*    เพิ่ม ?all=1 เพื่อดึงทุกห้องพร้อมสถานะ                                  */
/*    ตัวอย่าง: GET /api/rooms           -> เฉพาะห้องเปิดใช้งาน              */
/*             GET /api/rooms?all=1      -> ทุกห้อง พร้อม status/statusLabel   */
/* ------------------------------------------------------------------ */
router.get("/", auth, async (req, res) => {
  const { all } = req.query as { all?: string };

  const rows = await prisma.meetingRoom.findMany({
    where: buildRoomStatusWhere(all),
    select: {
      id: true,
      roomName: true,
      capacity: true,
      status: true, // << ส่ง enum กลับไปให้ด้วย
    },
    orderBy: [{ capacity: "asc" }, { roomName: "asc" }],
  });

  // ใส่ label ภาษาไทยอ่านง่าย (เผื่อฝั่งหน้าใช้โชว์ทันที)
  const items = rows.map((r) => ({
    ...r,
    statusLabel: statusLabelTH(r.status),
  }));

  res.json({ items });
});

/* ------------------------------------------------------------------ */
/* 2) เช็คความว่างห้องช่วงเวลา + ส่งสถานะห้องกลับไปด้วย                     */
/*    (ค่าเริ่มต้น: เฉพาะ AVAILABLE, เพิ่ม ?all=1 เพื่อรวมห้องปิดด้วย)       */
/*    GET /api/rooms/availability?start=ISO&end=ISO[&all=1]               */
/* ------------------------------------------------------------------ */
router.get("/availability", auth, async (req, res) => {
  const { start, end, all } = req.query as {
    start?: string;
    end?: string;
    all?: string;
  };
  if (!start || !end) {
    return res.status(400).json({ error: "start/end required (ISO)" });
  }

  const s = new Date(start);
  const e = new Date(end);

  // สถานะ booking ที่ถือว่า “บล็อกเวลา”
  const blockingStatuses: BookingStatus[] = [
    BookingStatus.AWAITING_ATTENDEE_CONFIRM,
    BookingStatus.AWAITING_ADMIN_APPROVAL,
    BookingStatus.APPROVED,
  ];

  const rooms = await prisma.meetingRoom.findMany({
    where: buildRoomStatusWhere(all),
    select: {
      id: true,
      roomName: true,
      capacity: true,
      status: true,
      bookings: {
        where: {
          status: { in: blockingStatuses },
          OR: [
            { startTime: { gte: s, lt: e } }, // เริ่มในช่วง
            { endTime: { gt: s, lte: e } },   // จบในช่วง
            {
              AND: [
                { startTime: { lte: s } },    // คร่อมช่วง
                { endTime: { gte: e } },
              ],
            },
          ],
        },
        select: { id: true, startTime: true, endTime: true, status: true },
      },
    },
    orderBy: [{ capacity: "asc" }, { roomName: "asc" }],
  });

  // ใส่สถานะภาษาไทย และ flag isBusyInRange (มี booking ชนช่วงเวลาหรือไม่)
  const items = rooms.map((r) => ({
    ...r,
    statusLabel: statusLabelTH(r.status),
    isBusyInRange: (r.bookings?.length || 0) > 0,
  }));

  res.json({ items });
});

// เพิ่ม: PUT /api/rooms/:id เพื่อให้ frontend เปลี่ยนสถานะได้จากแดชบอร์ด
router.put("/:id", auth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body as { status?: string };

  if (!status || !["AVAILABLE", "UNAVAILABLE"].includes(status)) {
    return res.status(400).json({ error: "invalid status" });
  }

  try {
    // id จาก params เป็น string -> แปลงเป็น number ก่อน (Prisma expecting number)
    const roomId = Number(id);
    if (Number.isNaN(roomId)) return res.status(400).json({ error: "invalid id" });

    const updated = await prisma.meetingRoom.update({
      where: { id: roomId },
      data: { status: status as any },
      // เอา 'floor' ทิ้งถ้า schema ไม่มี field นั้น
      select: { id: true, roomName: true, capacity: true, status: true },
    });

    // reuse statusLabel helper
    const item = {
      ...updated,
      statusLabel: statusLabelTH(updated.status),
    };

    res.json({ item });
  } catch (e) {
    console.error("rooms:update", e);
    res.status(500).json({ error: "update failed" });
  }
});

export default router;