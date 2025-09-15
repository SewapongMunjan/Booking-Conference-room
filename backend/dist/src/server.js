"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// โหลด Prisma client ส่วนกลาง (แนะนำให้มีไฟล์ src/prisma.ts ตามตัวอย่างก่อนหน้า)
const prisma_1 = require("./prisma");
// โหลด routers ที่เราสร้างไว้
const auth_1 = __importDefault(require("./routes/auth"));
const rooms_1 = __importDefault(require("./routes/rooms"));
const app = (0, express_1.default)();
// ====== Config ======
const PORT = Number(process.env.PORT || 3001);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
// CORS (อนุญาต frontend dev origin)
app.use((0, cors_1.default)({
    origin: CLIENT_ORIGIN,
    credentials: true,
}));
// รองรับ JSON body
app.use(express_1.default.json({ limit: "5mb" }));
// ====== Health Check ======
app.get("/health", async (_req, res) => {
    try {
        // ping DB เบา ๆ ให้มั่นใจว่าเชื่อมต่อได้
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        res.json({
            ok: true,
            service: "booking-backend",
            db: "connected",
            time: new Date().toISOString(),
        });
    }
    catch (e) {
        res.status(500).json({
            ok: false,
            service: "booking-backend",
            db: "disconnected",
            error: e.message,
        });
    }
});
// ====== Routes ======
app.use("/api/auth", auth_1.default);
app.use("/api/rooms", rooms_1.default);
// app.use("/api/bookings", bookingsRouter);
// app.use("/api/admin", adminRouter);
// app.use("/api/notifications", notificationsRouter);
// ====== 404 ======
app.use((_req, res) => {
    res.status(404).json({ error: "Not Found" });
});
// ====== Error Handler ======
app.use((err, _req, res, _next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal Server Error" });
});
// ====== Start Server ======
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`   CORS origin: ${CLIENT_ORIGIN}`);
});
exports.default = app;
