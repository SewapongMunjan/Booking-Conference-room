// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/** ชุดสิทธิ์ที่แนบอยู่ใน JWT (payload.pos) */
export interface RoleFlags {
  isAdmin?: boolean;
  isNoteManager?: boolean;
  isNoteTaker?: boolean;
  isHousekeeper?: boolean;
  isHousekeepingLead?: boolean;
}

/** ผู้ใช้ที่แนบเข้า req.user */
export interface AuthUser {
  sub: number;       // userId
  pos?: RoleFlags;   // สิทธิ์จากตำแหน่ง (Position)
}

// เพิ่ม type ให้กับ Express.Request
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/** ========= Auth: แนบ req.user จาก JWT =========
 * - อ่าน Authorization: Bearer <token>
 * - verify ด้วย JWT_SECRET
 * - แปลง sub → number
 * - แนบ pos (RoleFlags) เข้า req.user
 */
export function auth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const secret = process.env.JWT_SECRET || "devsecret";
    const decoded = jwt.verify(token, secret) as any;

    const subRaw = decoded?.sub;
    const subNum =
      typeof subRaw === "number"
        ? subRaw
        : typeof subRaw === "string"
        ? Number.parseInt(subRaw, 10)
        : NaN;

    if (!Number.isFinite(subNum)) {
      return res.status(401).json({ error: "Invalid token subject" });
    }

    const pos = decoded?.pos as RoleFlags | undefined;
    req.user = { sub: subNum, pos };
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

/** ========= Helpers ========= */
function hasAnyRole(pos: RoleFlags | undefined, keys: (keyof RoleFlags)[]) {
  if (!pos) return false;
  return keys.some((k) => Boolean(pos[k]));
}

/** Admin-only */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (hasAnyRole(req.user?.pos, ["isAdmin"])) return next();
  return res.status(403).json({ error: "Forbidden" });
}

/** Note Manager (หรือ Admin) */
export function requireNoteManager(req: Request, res: Response, next: NextFunction) {
  if (hasAnyRole(req.user?.pos, ["isAdmin", "isNoteManager"])) return next();
  return res.status(403).json({ error: "Forbidden" });
}

/** Note Taker (หรือ NoteManager/Admin) */
export function requireNoteTaker(req: Request, res: Response, next: NextFunction) {
  if (hasAnyRole(req.user?.pos, ["isAdmin", "isNoteManager", "isNoteTaker"])) return next();
  return res.status(403).json({ error: "Forbidden" });
}

/** แม่บ้านทั่วไป (หรือหัวหน้าแม่บ้าน/แอดมิน) */
export function requireHousekeeper(req: Request, res: Response, next: NextFunction) {
  if (hasAnyRole(req.user?.pos, ["isAdmin", "isHousekeeper", "isHousekeepingLead"])) return next();
  return res.status(403).json({ error: "Forbidden" });
}

/** หัวหน้าแม่บ้านเท่านั้น (หรือแอดมิน) */
export function requireHousekeepingLead(req: Request, res: Response, next: NextFunction) {
  if (hasAnyRole(req.user?.pos, ["isAdmin", "isHousekeepingLead"])) return next();
  return res.status(403).json({ error: "Forbidden" });
}
