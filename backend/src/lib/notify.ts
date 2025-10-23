import { prisma } from "../prisma";

export async function notify(userId: number, message: string) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        message,
        title: message.length > 50 ? message.slice(0, 50) : message,
        type: "INFO"
      } as any
    });
  } catch (e) {
    console.error("Notify failed:", e);
  }
}
