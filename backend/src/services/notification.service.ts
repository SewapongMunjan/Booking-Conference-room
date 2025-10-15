// src/services/notifications.services.ts
import { prisma } from "../prisma";
import { NotifType, RefType, Prisma } from "@prisma/client";
import { io } from "../server";

export interface MakeNotifInput {
  userId: number;
  message: string;
  type?: NotifType;
  title?: string;
  refType?: RefType | null;
  refId?: number | null;
}

/** สร้าง payload ให้เข้ากับ NotificationCreate(Many)Input */
export function makeNotif(input: MakeNotifInput): Prisma.NotificationCreateManyInput {
  return {
    userId: input.userId,
    message: input.message,
    type: input.type ?? NotifType.INVITE,
    title: input.title ?? "Notification",
    refType: input.refType ?? null,
    refId: input.refId ?? null,
  };
}

/** emit เฉพาะ badge (จำนวนยังไม่อ่าน) ให้ผู้ใช้ */
async function emitUnreadCount(userId: number) {
  try {
    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });
    io.to(`user:${userId}`).emit("notif:unreadCount", { count });
  } catch (e) {
    console.error("emitUnreadCount error:", e);
  }
}

/** emit รายการใหม่ (option) แล้วต่อด้วย badge ปัจจุบัน */
async function emitForUser(userId: number, item?: any) {
  try {
    if (item) {
      io.to(`user:${userId}`).emit("notif:new", { item });
    }
    await emitUnreadCount(userId);
  } catch (e) {
    console.error("emitForUser error:", e);
  }
}

/** create แบบเดี่ยว + realtime */
export async function createNotification(input: MakeNotifInput) {
  const row = await prisma.notification.create({
    data: makeNotif(input) as Prisma.NotificationUncheckedCreateInput,
  });

  // ส่ง item ใหม่ + อัปเดต badge ให้เฉพาะผู้ใช้นั้น
  await emitForUser(row.userId, row);
  return row;
}

/** createMany แบบชุด + realtime
 * หมายเหตุ: createMany ไม่คืนรายการ -> ดึงกลับมาจาก DB ด้วยช่วงเวลา t0
 */
export async function createNotificationsMany(inputs: MakeNotifInput[]) {
  if (!inputs?.length) return { count: 0 };

  // กัน clock precision: ย้อนเวลาไป 2 วินาทีก่อนยิง
  const t0 = new Date(Date.now() - 2000);

  const res = await prisma.notification.createMany({
    data: inputs.map(makeNotif),
    skipDuplicates: true,
  });

  // ผู้ใช้ที่เกี่ยวข้อง
  const userIds = Array.from(new Set(inputs.map((x) => x.userId)));

  // ดึงรายการที่น่าจะเพิ่งถูกสร้าง
  const rows = await prisma.notification.findMany({
    where: {
      userId: { in: userIds },
      createdAt: { gte: t0 },
    },
    orderBy: { id: "desc" },
    take: userIds.length * 10, // buffer เผื่อหลายแถวต่อคน
  });

  // group ตาม user เพื่อ emit ทีเดียวต่อ user
  const byUser = new Map<number, any[]>();
  for (const r of rows) {
    const list = byUser.get(r.userId) || [];
    list.push(r);
    byUser.set(r.userId, list);
  }

  for (const uid of userIds) {
    const list = byUser.get(uid) || [];
    // emit รายการใหม่ทั้งหมดให้ user นั้น
    for (const item of list) {
      io.to(`user:${uid}`).emit("notif:new", { item });
    }
    // แล้วอัปเดต badge
    await emitUnreadCount(uid);
  }

  return res;
}

/** ทำเป็นอ่านแล้ว (กันแก้ข้าม user) + realtime */
export async function markNotificationRead(id: number, userId: number) {
  const { count } = await prisma.notification.updateMany({
    where: { id, userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
  if (count === 0) throw new Error("NOT_FOUND");

  io.to(`user:${userId}`).emit("notif:update", { id, patch: { isRead: true } });
  await emitUnreadCount(userId);
  return { ok: true };
}

/** ทำทั้งหมดเป็นอ่านแล้ว + realtime */
export async function markAllNotificationsRead(userId: number) {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });

  io.to(`user:${userId}`).emit("notif:update-all-read", { ok: true });
  await emitUnreadCount(userId);
  return { success: true };
}
