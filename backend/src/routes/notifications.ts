import { Router } from "express";
import { prisma } from "../prisma";
import { auth } from "../middleware/auth";

const router = Router();

/** ดึงรายการแจ้งเตือนของฉัน */
router.get("/", auth, async (req, res) => {
  const userId = req.user!.sub;
  const items = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100, // กันล้น
  });
  res.json(items);
});

/** นับยังไม่อ่าน (ถ้าฟรอนท์เอนด์อยากโชว์ badge เร็ว ๆ) */
router.get("/count", auth, async (req, res) => {
  const userId = req.user!.sub;
  const count = await prisma.notification.count({
    where: { userId, isRead: false },
  });
  res.json({ count });
});

/** ทำเป็นอ่านแล้ว (เฉพาะ id ที่เป็นของ user นี้) */
router.patch("/:id/read", auth, async (req, res) => {
  const id = Number(req.params.id);
  const userId = req.user!.sub;
  await prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
  res.json({ ok: true });
});

/** ทำทั้งหมดเป็นอ่านแล้ว */
router.patch("/read-all", auth, async (req, res) => {
  const userId = req.user!.sub;
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  res.json({ ok: true });
});

export default router;
