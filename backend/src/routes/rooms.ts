import { Router } from "express";
import { prisma } from "../prisma";
import { auth } from "../middleware/auth";
import { BookingStatus } from "@prisma/client"; // ✅ ใช้ enum จาก Prisma

const router = Router();

// ห้องทั้งหมด + booking ช่วงเวลาที่ถามมา (แสดงการชนกันของช่วงเวลา)
router.get("/availability", auth, async (req, res) => {
  const { start, end } = req.query as { start?: string; end?: string };
  if (!start || !end) return res.status(400).json({ error: "start/end required (ISO)" });

  const s = new Date(start);
  const e = new Date(end);

  const blockingStatuses: BookingStatus[] = [
    BookingStatus.AWAITING_ATTENDEE_CONFIRM,
    BookingStatus.AWAITING_ADMIN_APPROVAL,
    BookingStatus.APPROVED,
    // (REJECTED/CANCELLED ไม่บล็อกเวลา)
  ];

  const rooms = await prisma.meetingRoom.findMany({
    include: {
      bookings: {
        where: {
          status: { in: blockingStatuses },
          OR: [
            { startTime: { gte: s, lt: e } },                 // เริ่มในช่วง
            { endTime: { gt: s, lte: e } },                   // จบในช่วง
            { AND: [{ startTime: { lte: s } }, { endTime: { gte: e } }] } // ครอบคลุมทั้งช่วง
          ]
        },
        select: { id: true, startTime: true, endTime: true, status: true }
      }
    },
    orderBy: [{ capacity: "asc" }, { roomName: "asc" }]
  });

  res.json(rooms);
});

// รายการห้องทั้งหมดอย่างย่อ
router.get("/", auth, async (_req, res) => {
  const rooms = await prisma.meetingRoom.findMany({
    orderBy: [{ capacity: "asc" }, { roomName: "asc" }]
  });
  res.json(rooms);
});

export default router;
