import { Router } from "express";
import { z } from "zod";
import { login, signup } from "../services/authService.js";

export const authRouter = Router();

const creds = z.object({
  username: z.string().min(3).max(24),
  password: z.string().min(4).max(64),
});

authRouter.post("/signup", async (req, res) => {
  try {
    const { username, password } = creds.parse(req.body);
    const { user, token } = await signup(username, password);
    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (e: any) {
    if (e?.message === "USERNAME_TAKEN")
      return res.status(409).json({ error: "USERNAME_TAKEN" });
    if (e?.issues) return res.status(400).json({ error: "BAD_REQUEST" });
    res.status(500).json({ error: "INTERNAL" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { username, password } = creds.parse(req.body);
    const { user, token } = await login(username, password);
    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (e: any) {
    if (e?.message === "INVALID_CREDENTIALS")
      return res.status(401).json({ error: "INVALID" });
    if (e?.issues) return res.status(400).json({ error: "BAD_REQUEST" });
    res.status(500).json({ error: "INTERNAL" });
  }
});
