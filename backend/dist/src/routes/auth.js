"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ error: "username/password required" });
    const user = await prisma_1.prisma.user.findUnique({
        where: { username },
        include: { position: true }
    });
    if (!user)
        return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt_1.default.compare(password, user.passwordHash);
    if (!ok)
        return res.status(401).json({ error: "Invalid credentials" });
    const token = jsonwebtoken_1.default.sign({ sub: user.id, pos: { isAdmin: user.position.isAdmin } }, process.env.JWT_SECRET, { expiresIn: "1d" });
    return res.json({
        token,
        user: {
            id: user.id,
            fullName: user.fullName,
            position: user.position.name,
            isAdmin: user.position.isAdmin
        }
    });
});
exports.default = router;
