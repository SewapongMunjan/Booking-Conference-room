import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthUser {
  sub: number; // userId
  pos?: { isAdmin?: boolean };
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function auth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Missing Authorization header" });

  const [scheme, token] = header.split(" ");
  if (!token || scheme.toLowerCase() !== "bearer") {
    return res.status(401).json({ error: "Invalid Authorization header" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    // jwt.verify() => string | JwtPayload
    if (typeof decoded === "string") {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    // ดึง sub และ pos ออกมา (sub อาจเป็น string ตาม typing ของ JwtPayload)
    const payload = decoded as JwtPayload & { pos?: { isAdmin?: boolean } };
    const subRaw = payload.sub;

    // แปลง sub ให้เป็น number อย่างปลอดภัย
    const subNum =
      typeof subRaw === "number"
        ? subRaw
        : typeof subRaw === "string"
        ? Number.parseInt(subRaw, 10)
        : NaN;

    if (!Number.isFinite(subNum)) {
      return res.status(401).json({ error: "Invalid token subject" });
    }

    req.user = { sub: subNum, pos: payload.pos };
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.pos?.isAdmin) {
    return res.status(403).json({ error: "Admin only" });
  }
  return next();
}
