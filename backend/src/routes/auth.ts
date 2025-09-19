import { Router } from "express";
import { prisma } from "../prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { auth } from "../middleware/auth";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body as { username: string; password: string };
    if (!username || !password) return res.status(400).json({ error: "username/password required" });

    
    const user = await prisma.user.findUnique({
      where: { username },
      include: { position: true },
    });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    // ✅ ฝัง flag admin ลงใน token
    const token = jwt.sign(
      {
        sub: user.id,
        pos: { isAdmin: !!user.position?.isAdmin },
      },
      process.env.JWT_SECRET!,
      { expiresIn: "8h" }
    );

    // (แนะนำ) endpoint ข้อมูลผู้ใช้ปัจจุบัน
    const me = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      position: user.position ? { id: user.position.id, name: user.position.name, isAdmin: !!user.position.isAdmin } : null,
    };

    return res.json({ token, me });
  } catch (e) {
    console.error("Login failed:", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/** GET /api/auth/me — ดึงข้อมูลผู้ใช้ปัจจุบันจาก JWT */
router.get("/me", auth, async (req, res) => {
  try {
    const userId = req.user!.sub;

    // ดึงข้อมูล user + position
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        position: {
          select: {
            id: true,
            name: true,
            isAdmin: true,
          },
        },
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    // รวมข้อมูลให้ง่ายสำหรับ frontend
    res.json({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      position: user.position,
      isAdmin: !!user.position?.isAdmin, // สะดวกให้ front ตรวจสิทธิ์ง่าย
    });
  } catch (e) {
    console.error("Fetch /auth/me failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


export default router;
