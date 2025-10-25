// src/middleware/auth.ts
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

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
  pos?: string | RoleFlags;   // สิทธิ์จากตำแหน่ง (Position)
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
  const header = String(req.headers.authorization || "");
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const secret = process.env.JWT_SECRET || "devsecret";
    const decoded = jwt.verify(token, secret) as any;

    const subRaw = decoded?.sub;
    const sub = typeof subRaw === "number" ? subRaw : Number(subRaw);
    if (!Number.isFinite(sub)) return res.status(401).json({ error: "Invalid token" });

    const posRaw = decoded?.pos;
    // normalize: keep original string or map to RoleFlags
    let pos: string | RoleFlags | undefined = undefined;
    if (!posRaw) pos = undefined;
    else if (typeof posRaw === "string") pos = posRaw;
    else if (typeof posRaw === "object") pos = posRaw as RoleFlags;

    req.user = { sub, pos };
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

/** ========= Helpers ========= */
// แก้ signature ให้รับ string | RoleFlags | undefined
function hasAnyRole(pos: string | RoleFlags | undefined, keys: (keyof RoleFlags)[]) {
  if (!pos) return false;

  if (typeof pos === 'string') {
    const s = pos.toLowerCase();
    const flags: RoleFlags = {
      isAdmin: s.includes('admin'),
      isNoteManager: s.includes('note manager') || s.includes('notemanager'),
      isNoteTaker: s.includes('note taker') || s.includes('notetaker') || s.includes('backup'),
      isHousekeeper: s.includes('housekeep') || s.includes('housekeeper'),
      isHousekeepingLead: s.includes('lead') && s.includes('housekeep'),
      // add other mappings if needed
    };
    return keys.some(k => Boolean(flags[k]));
  }

  // pos is RoleFlags-like
  return keys.some(k => Boolean((pos as RoleFlags)[k]));
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
  if (hasAnyRole(req.user?.pos, ["isNoteTaker"])) return next();

  // extra safety: also accept exact string matches if payload uses exact text
  const posRaw = req.user?.pos;
  if (typeof posRaw === 'string') {
    const normalized = posRaw.trim().toLowerCase();
    if (normalized === 'notetaker' || normalized === 'backup notetaker') return next();
  }

  return res.status(403).json({ error: "Notetaker only" });
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
