// src/routes/meta.ts
import { Router } from "express";
import { prisma } from "../prisma";
import { auth } from "../middleware/auth";

const router = Router();

// ตำแหน่งงาน
router.get("/positions", auth, async (_req, res) => {
  try {
    const positions = await prisma.position.findMany({
      where: { isAdmin: false },     //  ซ่อนตำแหน่ง Admin
      orderBy: { id: "asc" },        //  เรียงตาม ID
      select: {
        id: true,
        name: true,
        isAdmin: true,
        isNoteTaker: true,
        department: { select: { id: true, name: true } },
      },
    });
    res.json(positions);
  } catch (e) {
    console.error("GET /api/positions error:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// บริการ/อุปกรณ์
router.get("/services", auth, async (_req, res) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        category: true,
        requiresApproval: true,
        department: { select: { id: true, name: true } },
      },
    });
    res.json(services);
  } catch (e) {
    console.error("GET /api/services error:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
