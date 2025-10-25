// backend/src/routes/auth.ts
import { Router } from "express";
import { prisma } from "../prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { auth } from "../middleware/auth";

const router = Router();

/** Helper: สร้าง role flags จากตำแหน่ง */
function buildPos(position?: {
  isAdmin?: boolean;
  isNoteManager?: boolean;
  isNoteTaker?: boolean;
  isHousekeeper?: boolean;
  isHousekeepingLead?: boolean;
}) {
  return {
    isAdmin: !!position?.isAdmin,
    isNoteManager: !!position?.isNoteManager,
    isNoteTaker: !!position?.isNoteTaker,
    isHousekeeper: !!position?.isHousekeeper,
    isHousekeepingLead: !!position?.isHousekeepingLead,
  };
}

/** Helper: แปลงข้อมูล user -> payload สำหรับ frontend */
function toMePayload(user: any) {
  const pos = buildPos(user?.position);
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    position: user.position
      ? {
          id: user.position.id,
          name: user.position.name,
          ...pos,
        }
      : null,
    pos, // duplicate เผื่อ frontend อ่านจากตรงนี้
  };
}

/** 🔹 POST /api/auth/login — เข้าสู่ระบบ และฝัง role flags ลงใน JWT */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body as { username: string; password: string };
    if (!username || !password) {
      return res.status(400).json({ error: "username/password required" });
    }

    const user = await prisma.user.findUnique({
      where: { username },
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
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error("Missing JWT_SECRET env");
      return res.status(500).json({ error: "Server misconfigured" });
    }

    const pos = buildPos(user.position);
    const token = jwt.sign({ sub: user.id, pos }, JWT_SECRET, { expiresIn: "8h" });

    const me = toMePayload(user);

    // รักษา backward-compat: ส่งทั้ง me และ user
    return res.json({ token, me, user: me });
  } catch (e) {
    console.error("Login failed:", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/** ตัว handler ร่วมสำหรับ /me (ใช้ได้ทั้ง /api/auth/me และ /api/me) */
async function meHandler(req: any, res: any) {
  try {
    const userId = Number(req.user?.sub);
    if (!userId) return res.status(401).json({ error: "UNAUTHORIZED" });

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

    const me = toMePayload(user);
    // รักษา backward-compat: ส่งทั้ง me และ user
    return res.json({ me, user: me });
  } catch (e) {
    console.error("GET /me failed:", e);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/** 🔹 GET /api/auth/me — ตรวจ token และคืนข้อมูลผู้ใช้ปัจจุบัน */
router.get("/me", auth, meHandler);

/**
 * ✅ (Legacy alias) สำหรับ frontend เก่าที่เรียก /api/me
 * ใช้ไฟล์นี้ export router แยกเพื่อไป mount ที่ prefix /api
 */
export const meLegacyRouter = Router();
meLegacyRouter.get("/me", auth, meHandler);

export default router;
