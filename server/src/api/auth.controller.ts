import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

type User = { id: string; username: string; password: string };
const memUsers = new Map<string, User>();

export async function signup(req: Request, res: Response) {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ message: "Thiếu username/password" });
  if (memUsers.has(username))
    return res.status(409).json({ message: "Username đã tồn tại" });

  const user: User = { id: crypto.randomUUID(), username, password };
  memUsers.set(username, user);

  const token = jwt.sign({ sub: user.id, username }, config.JWT_SECRET, {
    expiresIn: "7d",
  });
  return res.status(201).json({ token, user: { id: user.id, username } });
}

export async function login(req: Request, res: Response) {
  const { username, password } = req.body || {};
  const user = memUsers.get(username);
  if (!user || user.password !== password)
    return res.status(401).json({ message: "Sai thông tin đăng nhập" });

  const token = jwt.sign({ sub: user.id, username }, config.JWT_SECRET, {
    expiresIn: "7d",
  });
  return res.json({ token, user: { id: user.id, username } });
}
