import { Router } from "express";
import { verifyToken } from "../services/authService.js";
import { prisma } from "../db/prisma.js";

export const userRouter = Router();

userRouter.get("/me", async (req, res) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "NO_TOKEN" });
  const userId = verifyToken(token);
  if (!userId) return res.status(401).json({ error: "INVALID_TOKEN" });

  const u = await prisma.user.findUnique({ where: { id: userId } });
  if (!u) return res.status(404).json({ error: "NOT_FOUND" });
  res.json({
    id: u.id,
    username: u.username,
    totalPoints: u.totalPoints,
    totalWins: u.totalWins,
    totalCorrectPairs: u.totalCorrectPairs,
  });
});

userRouter.get("/stats/:userId", async (req, res) => {
  const u = await prisma.user.findUnique({ where: { id: req.params.userId } });
  if (!u) return res.status(404).json({ error: "NOT_FOUND" });
  res.json({
    id: u.id,
    username: u.username,
    totalPoints: u.totalPoints,
    totalWins: u.totalWins,
    totalCorrectPairs: u.totalCorrectPairs,
  });
});
