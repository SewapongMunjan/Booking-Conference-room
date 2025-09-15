"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client"); // ✅ ใช้ enum จาก Prisma
const router = (0, express_1.Router)();
// ห้องทั้งหมด + booking ช่วงเวลาที่ถามมา (แสดงการชนกันของช่วงเวลา)
router.get("/availability", auth_1.auth, async (req, res) => {
    const { start, end } = req.query;
    if (!start || !end)
        return res.status(400).json({ error: "start/end required (ISO)" });
    const s = new Date(start);
    const e = new Date(end);
    const blockingStatuses = [
        client_1.BookingStatus.AWAITING_ATTENDEE_CONFIRM,
        client_1.BookingStatus.AWAITING_ADMIN_APPROVAL,
        client_1.BookingStatus.APPROVED,
        // (REJECTED/CANCELLED ไม่บล็อกเวลา)
    ];
    const rooms = await prisma_1.prisma.meetingRoom.findMany({
        include: {
            bookings: {
                where: {
                    status: { in: blockingStatuses },
                    OR: [
                        { startTime: { gte: s, lt: e } }, // เริ่มในช่วง
                        { endTime: { gt: s, lte: e } }, // จบในช่วง
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
router.get("/", auth_1.auth, async (_req, res) => {
    const rooms = await prisma_1.prisma.meetingRoom.findMany({
        orderBy: [{ capacity: "asc" }, { roomName: "asc" }]
    });
    res.json(rooms);
});
exports.default = router;
