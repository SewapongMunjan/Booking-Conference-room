// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

/**
 * โครงสร้างผู้ใช้ที่แนบเข้า req.user
 * - sub: userId (number)
 * - pos: meta จากตำแหน่ง/สิทธิ์ (boolean flags) — อิงจากสคีมา Position
 *   - isAdmin, isNoteManager, isNoteTaker
 */
export interface RoleFlags {
  isAdmin?: boolean;
  isNoteManager?: boolean;
  isNoteTaker?: boolean;
}

export interface AuthUser {
  sub: number;        // userId
  pos?: RoleFlags;    // อาจไม่ได้ใส่มาก็ได้
}

// เพิ่ม type ให้กับ Express.Request
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * auth middleware
 * - ตรวจ Authorization: Bearer <token>
 * - ถอดรหัส JWT ด้วย JWT_SECRET
 * - แปลง sub (string/number) → number
 * - ใส่ req.user = { sub, pos }
 */
export function auth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const [scheme, token] = header.split(" ");
  if (!token || scheme.toLowerCase() !== "bearer") {
    return res.status(401).json({ error: "Invalid Authorization header" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload | string;

    if (typeof decoded === "string") {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    // sub อาจเป็น string/number → แปลงให้เป็น number เสมอ
    const subRaw = decoded.sub;
    const subNum =
      typeof subRaw === "number"
        ? subRaw
        : typeof subRaw === "string"
        ? Number.parseInt(subRaw, 10)
        : NaN;

    if (!Number.isFinite(subNum)) {
      return res.status(401).json({ error: "Invalid token subject" });
    }

    // รับ pos จาก payload ถ้ามี (ควรยัดจากตำแหน่งของ user ตอน login)
    const pos = (decoded as any).pos as RoleFlags | undefined;

    req.user = { sub: subNum, pos };
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * requireAdmin
 * - อนุญาตเฉพาะผู้ใช้ที่ token มี pos.isAdmin === true
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.pos?.isAdmin) {
    return res.status(403).json({ error: "Admin only" });
  }
  return next();
}

/**
 * (ออปชัน) เจ้าของทรัพยากรเองหรือแอดมินเท่านั้น
 */
export function requireSelfOrAdmin(getOwnerId: (req: Request) => number | undefined) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ownerId = getOwnerId(req);
    if (ownerId == null) return res.status(400).json({ error: "Cannot resolve owner" });

    const me = req.user;
    if (!me) return res.status(401).json({ error: "Unauthorized" });

    if (me.sub === ownerId || me.pos?.isAdmin) {
      return next();
    }
    return res.status(403).json({ error: "Forbidden" });
  };
}

/**
 * isNotetaker middleware
 * - อนุญาต NoteTaker / NoteManager / Admin
 * - ไม่มี flag isBackupNoteTaker ในสคีมา: บทบาทสำรองให้แยกตรวจที่ระดับ Booking ผ่าน roleIndex ของ BookingNoteTaker
 */
export function isNotetaker(req: Request, res: Response, next: NextFunction) {
  const position = req.user?.pos;

  const canTakeNotes = !!(
    position?.isAdmin ||
    position?.isNoteManager ||
    position?.isNoteTaker
  );

  if (!canTakeNotes) {
    return res.status(403).json({ error: "Notetaker only" });
  }

  return next();
}
