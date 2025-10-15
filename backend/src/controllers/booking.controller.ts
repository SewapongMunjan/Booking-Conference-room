import { prisma } from "../prisma";
import { createNotification } from "../services/notification.service";

function fmt(start: Date, end: Date) {
  const s = new Date(start); const e = new Date(end);
  return `${s.toLocaleString()} - ${e.toLocaleString()}`;
}

export async function approveBooking(req: any, res: any) {
  const bookingId = Number(req.params.id);
  const approverId = Number(req.user.id);

  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "APPROVED", /* approvedById: approverId, approvedAt: new Date() */ },
    include: { invites: true, room: true, bookedBy: true }
  });

  // แจ้งเจ้าของและผู้ได้รับเชิญทั้งหมด
  const targetIds = new Set<number>([
    booking.bookedById,
    ...((booking.invites ?? []) as Array<{ userId: number }>).map((i) => i.userId)
  ]);
  await Promise.all(Array.from(targetIds).map((userId: number) => createNotification({
    userId,
    type: "APPROVED",
    title: "การจองได้รับการอนุมัติ",
    message: `ห้อง ${booking.room?.roomName} ${fmt(booking.startTime, booking.endTime)}`,
    refType: "BOOKING",
    refId: booking.id
  })));

  res.json({ success: true, booking });
}

export async function rejectBooking(req: any, res: any) {
  const bookingId = Number(req.params.id);
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "REJECTED" },
    include: { invites: true, room: true, bookedBy: true }
  });
  const targets = new Set<number>([booking.bookedById, ...booking.invites.map(i => i.userId)]);
  await Promise.all(Array.from(targets).map(userId => createNotification({
    userId, type: "REJECTED", title: "การจองถูกปฏิเสธ",
    message: `ห้อง ${booking.room.roomName} ${fmt(booking.startTime, booking.endTime)}`,
    refType: "BOOKING", refId: booking.id
  })));
  res.json({ success: true, booking });
}

export async function cancelBooking(req: any, res: any) {
  const bookingId = Number(req.params.id);
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
    include: { invites: true, room: true, bookedBy: true }
  });
  const targets = new Set<number>([booking.bookedById, ...booking.invites.map(i => i.userId)]);
  await Promise.all(Array.from(targets).map(userId => createNotification({
    userId, type: "CANCELED", title: "การจองถูกยกเลิก",
    message: `ห้อง ${booking.room.roomName} ${fmt(booking.startTime, booking.endTime)}`,
    refType: "BOOKING", refId: booking.id
  })));
  res.json({ success: true, booking });
}

export async function rescheduleBooking(req: any, res: any) {
  const bookingId = Number(req.params.id);
  const { startTime, endTime } = req.body;
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { startTime, endTime },
    include: { invites: true, room: true, bookedBy: true }
  });
  const targets = new Set<number>([booking.bookedById, ...booking.invites.map(i => i.userId)]);
  await Promise.all(Array.from(targets).map(userId => createNotification({
    userId, type: "RESCHEDULED", title: "เวลาประชุมถูกเปลี่ยนแปลง",
    message: `ห้อง ${booking.room.roomName} ${fmt(booking.startTime, booking.endTime)}`,
    refType: "BOOKING", refId: booking.id
  })));
  res.json({ success: true, booking });
}

// เมื่อเชิญรายบุคคล (สร้าง BookingInvite แล้ว)
export async function inviteUserToMeeting(req: any, res: any) {
  const { bookingId, userId } = req.body; // userId = ผู้ถูกเชิญ
  const invite = await prisma.bookingInvite.create({ data: {
    bookingId: Number(bookingId), userId: Number(userId)
  }});
  const booking = await prisma.booking.findUnique({ where: { id: Number(bookingId) }, include: { room: true }});
  if (booking) {
    await createNotification({
      userId: Number(userId),
      type: "INVITE",
      title: "เชิญเข้าร่วมการประชุม",
      message: `ห้อง ${booking.room.roomName} ${fmt(booking.startTime, booking.endTime)}`,
      refType: "BOOKING",
      refId: booking.id
    });
  }
  res.json({ success: true, invite });
}
