import express from "express";
import cors from "cors";
import { json } from "express";

import authRouter from "./api/auth.router";
import leaderboardRouter from "./api/ranking.router";
import userRouter from "./api/user.router";

export const app = express();
app.use(cors());
app.use(json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/leaderboard", leaderboardRouter);
