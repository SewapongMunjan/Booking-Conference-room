import { Router } from "express";
import { prisma } from "../prisma";
import { auth } from "../middleware/auth";
import { BookingStatus, NoteQueueStatus, Prisma } from "@prisma/client";

const router = Router();

/** GET /api/meetings?assignedTo=me&sort=nearest&page=1&pageSize=20 */
router.get("/meetings", auth, async (req, res) => {
  try {
    const meId = Number(req.user?.sub);
    const { assignedTo, sort = "nearest" } = req.query as Record<string, string>;
    const page = Math.max(parseInt((req.query.page as string) || "1", 10), 1);
    const pageSize = Math.min(Math.max(parseInt((req.query.pageSize as string) || "20", 10), 1), 100);
    const skip = (page - 1) * pageSize;

    // ❗️ไม่กรอง isActive เพราะไม่มีใน BookingNoteTakerWhereInput ของคุณ
    const where: Prisma.BookingWhereInput = {
      status: { not: BookingStatus.CANCELLED },
      ...(assignedTo === "me"
        ? { noteTakers: { some: { userId: meId } } }
        : {}),
    };

    const orderBy =
      sort === "latest"  ? { startTime: "desc" as const } :
      sort === "created" ? { createdAt: "desc" as const } :
                           { startTime: "asc"  as const };

    const [total, rows] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          // ✅ ใน schema ห้องมีฟิลด์ roomName
          room: { select: { roomName: true } },
          // ดึงสถานะของ "ผู้จดคนนี้" เพื่อ map เป็น m.status
          noteTakers: {
            where: { userId: meId },
            select: { status: true },
          },
        },
      }),
    ]);

    // ... เหมือนเดิมด้านบน

const items = rows.map((b) => {
  const ntStatus = b.noteTakers?.[0]?.status as NoteQueueStatus | undefined;
  const now = new Date();

  let viewStatus: "PENDING" | "IN_PROGRESS" | "DONE" = "PENDING";
  if (ntStatus === NoteQueueStatus.ACCEPTED) {
    if (b.endTime < now) {
      viewStatus = "DONE";
    } else if (b.startTime <= now && now <= b.endTime) {
      viewStatus = "IN_PROGRESS";
    } else {
      viewStatus = "PENDING";
    }
  } else {
    // INVITED / DECLINED / REPLACED → โชว์เป็น PENDING ไปก่อน
    viewStatus = "PENDING";
  }

  return {
    id: b.id,
    title: b.purpose ?? null,
    startTime: b.startTime,
    endTime: b.endTime,
    status: viewStatus,                         // ← ใช้กับ badge()/statusTH() ฝั่ง UI
    room: { roomName: b.room?.roomName ?? null },
    requester: { name: "" },
  };
});


    res.json({ items, pagination: { page, pageSize, total } });
  } catch (e: any) {
    console.error("GET /api/meetings failed:", e);
    res.status(500).json({ error: "Internal Server Error", message: e?.message });
  }
});

/** (stub) POST /api/meetings/:id/report */
router.post("/meetings/:id/report", auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { report } = req.body as { report?: string };
    // TODO: บันทึก report ตามตารางจริงของคุณ
    res.json({ ok: true });
  } catch (e: any) {
    console.error("POST /api/meetings/:id/report failed:", e);
    res.status(500).json({ error: "Internal Server Error", message: e?.message });
  }
});

export default router;
