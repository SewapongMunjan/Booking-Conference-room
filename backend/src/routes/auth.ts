// backend/src/routes/auth.ts
import { Router } from "express";
import { prisma } from "../prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { auth } from "../middleware/auth";

const router = Router();

/** 🔹 POST /api/auth/login — เข้าสู่ระบบ และฝัง role flags ลงใน JWT */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body as { username: string; password: string };
    if (!username || !password) {
      return res.status(400).json({ error: "username/password required" });
    }

    // หา user พร้อมตำแหน่งงาน
    const user = await prisma.user.findUnique({
      where: { username },
      include: { position: true },
    });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    // ตรวจรหัสผ่าน
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    // ✅ สร้าง RoleFlags จาก Position (schema ใหม่)
    const pos = {
      isAdmin: !!user.position?.isAdmin,
      isNoteManager: !!user.position?.isNoteManager,
      isNoteTaker: !!user.position?.isNoteTaker,
      isHousekeeper: !!user.position?.isHousekeeper,
      isHousekeepingLead: !!user.position?.isHousekeepingLead,
    };

    // ✅ สร้าง token พร้อม role flags
    const token = jwt.sign(
      { sub: user.id, pos },
      process.env.JWT_SECRET!,
      { expiresIn: "8h" }
    );

    // ✅ ส่งข้อมูลกลับไปให้ frontend ใช้งาน
    const me = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      position: {
        id: user.position?.id,
        name: user.position?.name,
        ...pos,
      },
    };

    return res.json({ token, me });
  } catch (e) {
    console.error("Login failed:", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/** 🔹 GET /api/auth/me — ตรวจ token และคืนข้อมูลผู้ใช้ปัจจุบัน */
router.get("/me", auth, async (req, res) => {
  try {
    const userId = req.user!.sub;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        position: {
          select: {
            id: true,
            name: true,
            isAdmin: true,
            isNoteManager: true,
            isNoteTaker: true,
            isHousekeeper: true,
            isHousekeepingLead: true,
          },
        },
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      position: user.position,
      pos: {
        isAdmin: !!user.position?.isAdmin,
        isNoteManager: !!user.position?.isNoteManager,
        isNoteTaker: !!user.position?.isNoteTaker,
        isHousekeeper: !!user.position?.isHousekeeper,
        isHousekeepingLead: !!user.position?.isHousekeepingLead,
      },
    });
  } catch (e) {
    console.error("Fetch /auth/me failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
