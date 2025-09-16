import { Router } from "express";
import { topLeaderboard } from "../services/leaderboardService.js";

export const leaderboardRouter = Router();

leaderboardRouter.get("/", async (_req, res) => {
  const top = await topLeaderboard(100);
  res.json(top);
});
