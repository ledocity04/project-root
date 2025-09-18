import express from "express";
import cors from "cors";
import http from "http";
import { Server as IOServer } from "socket.io";
import { PrismaClient } from "@prisma/client";

const app = express();
const server = http.createServer(app);
const io = new IOServer(server, {
  cors: { origin: process.env.CORS_ORIGIN || "http://localhost:5173" },
});

const prisma = new PrismaClient();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:5173"],
    credentials: false,
  })
);

// ===== API Leaderboard =====
app.get("/api/leaderboard", async (_req, res) => {
  try {
    // tuỳ schema của bạn, ví dụ:
    // bảng User có trường totalPoints
    const top = await prisma.user.findMany({
      select: { id: true, username: true, totalPoints: true },
      orderBy: { totalPoints: "desc" },
      take: 20,
    });
    res.json(top);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "internal_error" });
  }
});

// ===== Socket.io presence (stub) =====
io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  socket.on("presence:list", async () => {
    // TODO: truy vấn danh sách online thực tế
    socket.emit("presence:list:result", []);
  });
});

const PORT = Number(process.env.PORT || 3001);
server.listen(PORT, () => {
  console.log("Server listening on http://localhost:" + PORT);
});
app.get("/health", (_req, res) => res.json({ ok: true }));
