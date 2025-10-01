import { Router } from "express";
import { prisma } from "../prisma";
import { auth, requireAdmin } from "../middleware/auth";

const router = Router();

/** GET /api/notetakers/queue — ดูคิวปัจจุบัน */
router.get("/queue", auth, async (_req, res) => {
  try {
    const rows = await prisma.noteTakerQueue.findMany({
      where: { isActive: true },
      orderBy: { orderNo: "asc" },
      select: {
        userId: true,
        orderNo: true,
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
 * body: { take?: number } — หมุนคิวบนสุดลงท้าย (จำลองการเลื่อนคิว)
 * admin only
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

export default router;