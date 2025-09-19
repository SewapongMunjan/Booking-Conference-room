import { Router } from "express";
import { prisma } from "../prisma";
import { auth } from "../middleware/auth";
import { InviteStatus, BookingStatus } from "@prisma/client";

const router = Router();

/** GET /api/invites/my
 *  query: status?=INVITED|ACCEPTED|DECLINED, page?, pageSize?
 */
router.get("/my", auth, async (req, res) => {
  try {
    const userId = req.user!.sub;

    const { status, page = "1", pageSize = "10" } = req.query as {
      status?: string;
      page?: string;
      pageSize?: string;
    };

    const where = {
      userId,
      ...(status ? { status: status as InviteStatus } : {}),
    };

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const sizeNum = Math.min(50, Math.max(1, parseInt(String(pageSize), 10) || 10));

    const total = await prisma.bookingInvite.count({ where });

    const items = await prisma.bookingInvite.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (pageNum - 1) * sizeNum,
      take: sizeNum,
      include: {
        booking: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
            room: { select: { id: true, roomName: true, capacity: true } },
          },
        },
      },
    });

    return res.json({ page: pageNum, pageSize: sizeNum, total, items });
  } catch (e) {
    console.error("List my invites failed:", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/** POST /api/invites/:id/accept — ผู้ใช้กดยืนยันคำเชิญ */
router.post("/:id/accept", auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const me = req.user!.sub;

    const invite = await prisma.bookingInvite.findUnique({ where: { id } });
    if (!invite || invite.userId !== me) {
      return res.status(404).json({ error: "Invite not found" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.bookingInvite.update({
        where: { id },
        data: { status: InviteStatus.ACCEPTED },
      });

      // ถ้าไม่มี INVITED เหลือ → เปลี่ยน booking เป็น AWAITING_ADMIN_APPROVAL
      const remaining = await tx.bookingInvite.count({
        where: { bookingId: invite.bookingId, status: InviteStatus.INVITED },
      });
      if (remaining === 0) {
        await tx.booking.update({
          where: { id: invite.bookingId },
          data: { status: BookingStatus.AWAITING_ADMIN_APPROVAL },
        });
      }
    });

    return res.json({ ok: true });
  } catch (e) {
    console.error("Accept invite failed:", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/** POST /api/invites/:id/decline — ผู้ใช้กดปฏิเสธคำเชิญ */
router.post("/:id/decline", auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const me = req.user!.sub;

    const invite = await prisma.bookingInvite.findUnique({ where: { id } });
    if (!invite || invite.userId !== me) {
      return res.status(404).json({ error: "Invite not found" });
    }

    await prisma.bookingInvite.update({
      where: { id },
      data: { status: InviteStatus.DECLINED },
    });

    return res.json({ ok: true });
  } catch (e) {
    console.error("Decline invite failed:", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
