import { Router } from "express";
import { prisma } from "../prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body as { username: string; password: string };
  if (!username || !password) return res.status(400).json({ error: "username/password required" });

  const user = await prisma.user.findUnique({
    where: { username },
    include: { position: true }
  });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { sub: user.id, pos: { isAdmin: user.position.isAdmin } },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" }
  );

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

export default router;
