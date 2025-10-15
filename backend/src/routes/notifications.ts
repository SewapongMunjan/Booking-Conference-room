// src/routes/notifications.ts
import { Router } from "express";
import { prisma } from "../prisma";
import { auth } from "../middleware/auth";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "../services/notification.service"; // <- แก้ path ให้ตรง

const router = Router();

/** GET /api/notifications
 *  ?limit=50  | จำนวนสูงสุด
 *  ?unread=1  | เอาเฉพาะยังไม่อ่าน
 */
router.get("/", auth, async (req: any, res) => {
  try {
    const userId = Number(req.user!.sub);
    const limit = Math.min(100, Number(req.query.limit ?? 50));
    const unread = req.query.unread === "1" || req.query.unread === "true";

    const items = await prisma.notification.findMany({
      where: { userId, ...(unread ? { isRead: false } : {}) },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    res.json({ items }); // ให้เป็น { items } เพื่อให้หน้าเว็บอ่านง่าย
  } catch (e) {
    console.error("GET /notifications error:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/** GET /api/notifications/unread-count */
router.get("/unread-count", auth, async (req: any, res) => {
  try {
    const userId = Number(req.user!.sub);
    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });
    res.json({ count });
  } catch (e) {
    console.error("GET /notifications/unread-count error:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/** (alias) GET /api/notifications/count */
router.get("/count", auth, async (req: any, res) => {
  try {
    const userId = Number(req.user!.sub);
    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });
    res.json({ count });
  } catch (e) {
    console.error("GET /notifications/count error:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/** PATCH /api/notifications/:id/read -> mark read รายการเดียว (ใช้ service เพื่อ emit) */
router.patch("/:id/read", auth, async (req: any, res) => {
  try {
    const userId = Number(req.user!.sub);
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "BAD_ID" });

    await markNotificationRead(id, userId); // ใช้ service -> จะ emit ให้ client ด้วย
    res.json({ ok: true });
  } catch (e: any) {
    if (e?.message === "NOT_FOUND") {
      return res.status(404).json({ error: "NOT_FOUND" });
    }
    console.error("PATCH /notifications/:id/read error:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/** PATCH /api/notifications/read-all -> mark read ทั้งหมดของผู้ใช้ (ใช้ service เพื่อ emit) */
router.patch("/read-all", auth, async (req: any, res) => {
  try {
    const userId = Number(req.user!.sub);
    await markAllNotificationsRead(userId); // ใช้ service -> emit ให้ client
    res.json({ ok: true });
  } catch (e) {
    console.error("PATCH /notifications/read-all error:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
