// server/src/server.ts
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "dev";

// demo in-memory user store (để test nhanh)
type User = { id: string; username: string; password: string };
const memUsers = new Map<string, User>();

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/api/auth/register", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ message: "Thiếu username/password" });
  if (memUsers.has(username))
    return res.status(409).json({ message: "Username đã tồn tại" });

  const user: User = { id: crypto.randomUUID(), username, password };
  memUsers.set(username, user);

  const token = jwt.sign({ sub: user.id, username }, JWT_SECRET, {
    expiresIn: "7d",
  });
  return res.status(201).json({ token, user: { id: user.id, username } });
});

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  const user = memUsers.get(username);
  if (!user || user.password !== password)
    return res.status(401).json({ message: "Sai thông tin đăng nhập" });

  const token = jwt.sign({ sub: user.id, username }, JWT_SECRET, {
    expiresIn: "7d",
  });
  return res.json({ token, user: { id: user.id, username } });
});

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () =>
  console.log(`Server listening on http://localhost:${PORT}`)
);
