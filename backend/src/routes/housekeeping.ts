// src/routes/housekeeping.ts
import { Router } from "express";
import { auth, requireHousekeeper, requireHousekeepingLead } from "../middleware/auth";
import { prisma } from "../prisma";

const router = Router();

/** ✅ Dashboard: แม่บ้านดูรายการงานที่ตัวเองต้องทำ */
router.get("/dashboard", auth, requireHousekeeper, async (req, res) => {
  const userId = req.user!.sub;

  // ตัวอย่าง: ดึงงานที่ assigned ให้แม่บ้านคนนี้
  const jobs = await (prisma as any).cleaningTask.findMany({
    where: { assignedToId: userId },
    orderBy: { createdAt: "desc" },
  });

  res.json({ items: jobs });
});

/** ✅ Manager: หัวหน้าแม่บ้านดูภาพรวมงานทั้งหมด */
router.get("/manage", auth, requireHousekeepingLead, async (_req, res) => {
  const allJobs = await (prisma as any).cleaningTask.findMany({
    orderBy: { createdAt: "desc" },
    include: { assignedTo: { select: { fullName: true } } },
  });
  res.json({ items: allJobs });
});

/** ✅ แม่บ้านอัปเดตสถานะงาน */
router.post("/update/:id", auth, requireHousekeeper, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  await (prisma as any).cleaningTask.update({
    where: { id: Number(id) },
    data: { status },
  });
  res.json({ message: "Updated successfully" });
});

export default router;
