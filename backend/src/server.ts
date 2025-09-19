// src/server.ts
import dotenv from "dotenv";
dotenv.config();



import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

// โหลด Prisma client ส่วนกลาง (แนะนำให้มีไฟล์ src/prisma.ts ตามตัวอย่างก่อนหน้า)
import { prisma } from "./prisma";

// โหลด routers ที่เราสร้างไว้
import authRouter from "./routes/auth";
import roomsRouter from "./routes/rooms";
import bookingsRouter from "./routes/bookings";
import metaRoutes from "./routes/meta";
import invitesRouter from "./routes/invites";




const app = express();

// ====== Config ======
const PORT = Number(process.env.PORT || 3001);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// CORS (อนุญาต frontend dev origin)
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);

// รองรับ JSON body
app.use(express.json({ limit: "5mb" }));

// ====== Health Check ======
app.get("/health", async (_req: Request, res: Response) => {
  try {
    // ping DB เบา ๆ ให้มั่นใจว่าเชื่อมต่อได้
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      ok: true,
      service: "booking-backend",
      db: "connected",
      time: new Date().toISOString(),
    });
  } catch (e) {
    res.status(500).json({
      ok: false,
      service: "booking-backend",
      db: "disconnected",
      error: (e as Error).message,
    });
  }
});

// ====== Routes ======
app.use("/api/auth", authRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api", metaRoutes);    
app.use("/api/invites", invitesRouter);
// app.use("/api/admin", adminRouter);
// app.use("/api/notifications", notificationsRouter);

// ====== 404 ======
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

// ====== Error Handler ======
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// ====== Start Server ======
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`   CORS origin: ${CLIENT_ORIGIN}`);
});

export default app;
