import { prisma } from "../prisma";

export async function notify(userId: number, message: string) {
  try {
    await prisma.notification.create({ data: { userId, message } });
  } catch (e) {
    console.error("Notify failed:", e);
  }
}
