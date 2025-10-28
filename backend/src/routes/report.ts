// backend/src/routes/issues.ts
import { Router, Request, Response } from "express";
import * as db from "../prisma";

// รองรับทั้ง export แบบ named/default
const prisma = (db as any).prisma || (db as any).default || (db as any);

const router = Router();

/**
 * Helper: map severity (low/medium/high) -> PRIORITY enum string (LOW/MEDIUM/HIGH)
 */
function severityToPriority(sev?: unknown) {
  if (!sev) return undefined;
  const s = String(sev).toLowerCase();
  if (s === "low") return "LOW";
  if (s === "high") return "HIGH";
  return "MEDIUM";
}

/**
 * Helper: sanitize priority
 */
function normalizePriority(
  p?: unknown,
  fallback: "LOW" | "MEDIUM" | "HIGH" = "MEDIUM"
) {
  if (!p) return fallback;
  const up = String(p).toUpperCase();
  if (up === "LOW" || up === "MEDIUM" || up === "HIGH") return up as any;
  // เผื่อส่งมาเป็น lowercase
  if (up === "low") return "LOW";
  if (up === "medium") return "MEDIUM";
  if (up === "high") return "HIGH";
  return fallback;
}

/**
 * GET /api/issues
 * query: page, pageSize, sort
 */
router.get("/api/issues", async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.max(1, Number(req.query.pageSize || 50));
    const sort = String(req.query.sort || "-createdAt");

    const orderBy: Record<string, "asc" | "desc"> = {};
    if (sort.startsWith("-")) orderBy[sort.slice(1)] = "desc";
    else orderBy[sort] = "asc";

    const [items, total] = await Promise.all([
      prisma.issue.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy,
        include: {
          reporter: { select: { id: true, fullName: true, email: true } },
          // ไม่ include ความสัมพันธ์ห้อง เพื่อลดปัญหาชื่อ relation ไม่ตรง schema
          // ถ้า relation ของคุณชื่อ meetingRoom ให้เปิดใช้บรรทัดด้านล่างแทน:
          // meetingRoom: true,
        },
      }),
      prisma.issue.count(),
    ]);

    return res.json({ items, total, page, pageSize });
  } catch (err) {
    console.error("GET /api/issues error", err);
    return res.status(500).json({ error: "cannot load issues" });
  }
});

/**
 * POST /api/issues
 * body: issueType, subject, description, priority? | severity?, roomId?, reporterId?
 *
 * หมายเหตุ:
 * - รองรับการส่งทั้ง priority: "LOW|MEDIUM|HIGH" และ severity: "low|medium|high"
 * - roomId เป็น optional; ถ้าส่งมา ต้องเป็นตัวเลขและมีอยู่จริง (ตรวจใน MeetingRoom)
 * - reporterId จะอ่านจาก JWT (req.user.sub) ก่อน ถ้าไม่มีจะ fallback หา user ตัวแรก
 */
router.post("/api/issues", async (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};

    // --- normalize inputs ---
    const issueType = String(body.issueType ?? "").trim();
    const subject = String(body.subject ?? "").trim();
    const description = String(body.description ?? "").trim();

    if (!issueType || !subject || !description) {
      return res
        .status(400)
        .json({ error: "issueType, subject and description are required" });
    }

    // priority รับได้ทั้ง priority และ severity
    let priority = normalizePriority(body.priority);
    const sevAsPriority = severityToPriority(body.severity);
    if (sevAsPriority) priority = sevAsPriority;

    // resolve reporter id (JWT -> body -> fallback first user)
    let reporterId = Number((req as any).user?.sub ?? body.reporterId ?? 0);
    if (!reporterId || Number.isNaN(reporterId)) {
      const first = await prisma.user.findFirst({ select: { id: true } });
      if (first) reporterId = first.id;
    }
    if (!reporterId) {
      return res
        .status(400)
        .json({ error: "reporterId required (authenticate or provide reporterId)" });
    }

    // validate optional roomId กับตาราง 'MeetingRoom' (ของจริง)
    let roomIdToUse: number | undefined = undefined;
    if (
      body.roomId !== undefined &&
      body.roomId !== null &&
      String(body.roomId).trim() !== ""
    ) {
      const idNum = Number(body.roomId);
      if (Number.isNaN(idNum)) {
        return res.status(400).json({ error: "roomId must be a number" });
      }
      const mr = await prisma.meetingRoom.findUnique({ where: { id: idNum } });
      if (!mr) {
        return res.status(400).json({ error: "roomId not found" });
      }
      roomIdToUse = idNum;
    }

    const data: any = {
      reporterId,
      issueType,
      subject,
      description,
      priority, // LOW | MEDIUM | HIGH
    };
    if (roomIdToUse !== undefined) data.roomId = roomIdToUse; // FK ชี้ไป MeetingRoom.id

    const issue = await prisma.issue.create({
      data,
      include: {
        reporter: { select: { id: true, fullName: true, email: true } },
        // ดูหมายเหตุด้านบนเรื่อง relation ห้อง
        // meetingRoom: true,
      },
    });

    return res.json({ issue });
  } catch (err: any) {
    console.error("POST /api/issues error:", err && err.stack ? err.stack : err);
    // Prisma FK
    if (err?.code === "P2003") {
      return res
        .status(400)
        .json({ error: "Foreign key constraint failed (invalid reporterId or roomId)" });
    }
    // Prisma validation
    if (err?.code === "P2025") {
      return res.status(400).json({ error: "Related record not found" });
    }
    return res.status(500).json({ error: err?.message || "Internal Server Error" });
  }
});

export default router;
