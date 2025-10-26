// src/server.ts
import dotenv from "dotenv";
dotenv.config();

import http from "http";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { Server as IOServer } from "socket.io";

import { prisma } from "./prisma";

import { auth } from "./middleware/auth";

// Routers
import authRouter, { meLegacyRouter } from "./routes/auth";
import roomsRouter from "./routes/rooms";
import bookingsRouter from "./routes/bookings";
import metaRoutes from "./routes/meta";
import invitesRouter from "./routes/invites";
import notetakersRouter from "./routes/notetakers";
import notificationsRouter from "./routes/notifications";
import housekeepingRoutes from "./routes/housekeeping";
import meetings from "./routes/meetings";

// ⬇️ ⬇️ ⬇️  เพิ่ม: router สำหรับ PDF
import bookingsPdfRouter from "./routes/bookings.pdf";

const app = express();
const PORT = Number(process.env.PORT || 3001);

// อนุญาตหลาย origin ได้แบบ comma-separated ใน .env
const ORIGINS = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.ACCESS_TOKEN_SECRET ||
  "dev-secret-change-me";

// ====== Middlewares (REST) ======
app.use(
  cors({
    origin(origin, cb) {
      // allow no-origin (mobile app/postman) หรือทุก origin ในลิสต์
      if (!origin || ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));

// ====== Health Check ======
app.get("/health", async (_req: Request, res: Response) => {
  try {
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

app.get("/api/me", auth, async (req: Request, res: Response) => {
  try {
    const uid = req.user!.sub;
    const user = await prisma.user.findUnique({
      where: { id: uid },
      include: { position: { include: { department: true } } },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      position: user.position?.name ?? null,
      department: user.position?.department?.name ?? null,
      roles: {
        isAdmin: user.position?.isAdmin ?? false,
        isNoteManager: user.position?.isNoteManager ?? false,
        isNoteTaker: user.position?.isNoteTaker ?? false,
        isHousekeeper: user.position?.isHousekeeper ?? false,
        isHousekeepingLead: user.position?.isHousekeepingLead ?? false,
      },
    });
  } catch (err) {
    console.error("GET /api/me failed:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ====== Routes ======
// ⚠️ สำคัญ: ใส่เส้นทาง PDF "ก่อน" bookingsRouter เสมอ เพื่อให้ /:id/pdf ทำงานได้
app.use("/api/bookings", bookingsPdfRouter);

app.use("/api/auth", authRouter);
app.use("/api/me", meLegacyRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api", metaRoutes);
app.use("/api/invites", invitesRouter);
app.use("/api/notetakers", notetakersRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/housekeeping", housekeepingRoutes);
app.use("/api", meetings);

// ====== 404 ======
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

// ====== Error Handler ======
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// ====== HTTP & Socket.IO ======
const httpServer = http.createServer(app);

export const io = new IOServer(httpServer, {
  cors: {
    origin(origin, cb) {
      if (!origin || ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS (socket)"));
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 20000,
  pingInterval: 25000,
});

// helper: verify JWT (ต้องมี sub)
function verifyAccessToken(token: string): { sub: number } {
  const payload = jwt.verify(token, JWT_SECRET) as any;
  if (!payload || typeof payload.sub === "undefined") {
    throw new Error("INVALID_PAYLOAD");
  }
  return { sub: Number(payload.sub) };
}

// Auth สำหรับ Socket.IO
io.use((socket, next) => {
  try {
    const auth = socket.handshake.auth as any;
    const query = socket.handshake.query as any;
    const headers = socket.handshake.headers as any;

    const bearer =
      (headers?.authorization as string)?.replace(/^Bearer\s+/i, "") || "";
    const token: string | undefined =
      (auth && auth.token) ||
      (query && (query.token as string)) ||
      bearer ||
      undefined;

    if (token) {
      try {
        const { sub } = verifyAccessToken(token);
        (socket as any).userId = sub;
      } catch {
        // ไม่ block; เพียงแค่ไม่มี userId
      }
    }
    next();
  } catch {
    next();
  }
});

// Join ห้องผู้ใช้เมื่อต่อสำเร็จ
io.on("connection", (socket) => {
  const uid = (socket as any).userId as number | undefined;

  if (uid) {
    socket.join(`user:${uid}`);
    socket.emit("connected", { ok: true, userId: uid });
    console.log("🔌 socket connected - user:", uid);
  } else {
    socket.emit("connected", { ok: true, userId: null });
    console.log("🔌 socket connected - anonymous");
  }

  socket.on("disconnect", () => {
    console.log("🔌 socket disconnected:", uid ?? "anonymous");
  });
});

// ====== Start Server ======
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`   CORS origins: ${ORIGINS.join(", ")}`);
});

// ====== Graceful shutdown ======
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received, shutting down...`);
  try {
    await io.close();
    await prisma.$disconnect();
    httpServer.close(() => process.exit(0));
  } catch (e) {
    console.error("Shutdown error:", e);
    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

export default app;
