import type { Server, Socket } from "socket.io";
import { requireAuth } from "./guards.js";
import { z } from "zod";
import {
  createInvite,
  consumeInvite,
  cancelInvite,
  getInvite,
} from "../services/matchmakingService.js";
import {
  createRoom,
  getState,
  handleFlip,
  handleSendPair,
  joinRoomSocket,
  playerExitMatch,
} from "../services/roomService.js";
import { prisma } from "../db/prisma.js";

const presence = new Map<
  string,
  {
    userId: string;
    username: string;
    status: "idle" | "busy";
    socketId: string;
  }
>();

function broadcastPresence(io: Server) {
  io.emit("presence:update", {
    players: Array.from(presence.values()).map((p) => ({
      userId: p.userId,
      username: p.username,
      status: p.status,
    })),
  });
}

export function registerSocketEvents(io: Server) {
  io.on("connection", (socket: Socket) => {
    let userId: string | null = null;
    let username: string | null = null;

    /* ------------ AUTH ------------ */
    socket.on("auth:token", async () => {
      const uid = requireAuth(socket);
      if (!uid) {
        try {
          socket.disconnect();
        } catch {}
        return;
      }
      userId = uid;
      const u = await prisma.user.findUnique({ where: { id: uid } });
      username = u?.username || "unknown";
      presence.set(socket.id, {
        userId,
        username,
        status: "idle",
        socketId: socket.id,
      });
      broadcastPresence(io);
    });

    /* ------------ PRESENCE ------------ */
    socket.on("presence:list", () => {
      broadcastPresence(io);
    });

    /* ------------ INVITE ------------ */
    const InviteSchema = z.object({
      toUserId: z.string().min(1),
      rows: z.number().int().min(2).max(10).default(4),
      cols: z.number().int().min(2).max(10).default(4),
      turnSeconds: z.number().int().min(5).max(120).default(20),
    });

    socket.on("invite:send", async (payload) => {
      if (!userId) return;
      const p = InviteSchema.safeParse(payload);
      if (!p.success)
        return socket.emit("error", {
          code: "BAD_INVITE",
          message: "Invalid invite",
        });

      const inv = createInvite(
        userId,
        p.data.toUserId,
        p.data.rows,
        p.data.cols,
        p.data.turnSeconds
      );

      for (const entry of presence.values()) {
        if (entry.userId === p.data.toUserId) {
          io.to(entry.socketId).emit("invite:received", {
            inviteId: inv.id,
            from: { userId, username },
            rows: inv.rows,
            cols: inv.cols,
            turnSeconds: inv.turnSeconds,
          });
        }
      }
    });

    socket.on("invite:cancel", ({ inviteId }) => {
      if (!userId) return;
      const inv = getInvite(inviteId);
      if (!inv || inv.fromUserId !== userId) return;
      cancelInvite(inviteId);
      for (const entry of presence.values()) {
        if (entry.userId === inv.toUserId) {
          io.to(entry.socketId).emit("invite:canceled", { inviteId });
        }
      }
    });

    socket.on("invite:respond", async ({ inviteId, response }) => {
      if (!userId) return;
      const inv = consumeInvite(inviteId);
      if (!inv)
        return socket.emit("invite:result", {
          inviteId,
          ok: false,
          reason: "NOT_FOUND",
        });
      if (inv.toUserId !== userId)
        return socket.emit("invite:result", {
          inviteId,
          ok: false,
          reason: "NOT_YOURS",
        });

      if (response === "accept") {
        const room = await createRoom(
          inv.fromUserId,
          inv.toUserId,
          inv.rows,
          inv.cols,
          inv.turnSeconds
        );
        for (const entry of presence.values()) {
          if ([inv.fromUserId, inv.toUserId].includes(entry.userId)) {
            entry.status = "busy";
            io.to(entry.socketId).emit("invite:result", {
              inviteId,
              ok: true,
              matchId: room.id,
            });
          }
        }
      } else {
        for (const entry of presence.values()) {
          if (entry.userId === inv.fromUserId) {
            io.to(entry.socketId).emit("invite:result", {
              inviteId,
              ok: false,
              reason: "REJECTED",
            });
          }
        }
      }
      broadcastPresence(io);
    });

    /* ------------ MATCH ------------ */
    socket.on("match:join", async ({ matchId }) => {
      if (!userId) return;
      const m = await prisma.match.findUnique({ where: { id: matchId } });
      if (!m)
        return socket.emit("error", {
          code: "MATCH_NOT_FOUND",
          message: "Match not found",
        });
      if (![m.p1Id, m.p2Id].includes(userId))
        return socket.emit("error", {
          code: "NOT_IN_MATCH",
          message: "Not a participant",
        });

      joinRoomSocket(matchId, socket.id);
      socket.join(`room:${matchId}`);

      const state = getState(matchId);
      if (!state) {
        return socket.emit("match:state", { matchId, status: "FINISHED" });
      }
      socket.emit("match:state", {
        matchId,
        rows: state.rows,
        cols: state.cols,
        openedPairs: state.openedPairs,
        currentTurnUserId: state.currentTurnUserId,
        scores: state.scores,
        flipBuffer: state.flipBuffer,
        deadline: state.turnDeadline,
        status: state.status,
      });
      io.to(`room:${matchId}`).emit("match:turn:update", {
        userId: state.currentTurnUserId,
        deadline: state.turnDeadline,
      });
    });

    socket.on("match:flip", ({ matchId, cardIndex }) => {
      if (!userId) return;
      const r = handleFlip(matchId, userId, Number(cardIndex));
      if (!r.ok) socket.emit("error", { code: r.code, message: r.code });
    });

    socket.on("match:sendPair", async ({ matchId }) => {
      if (!userId) return;
      const r = await handleSendPair(matchId, userId);
      if (!r.ok) socket.emit("error", { code: r.code, message: r.code });
    });

    socket.on("match:exit", async ({ matchId }) => {
      if (!userId) return;
      await playerExitMatch(matchId, userId);
      const pres = presence.get(socket.id);
      if (pres) pres.status = "idle";
      broadcastPresence(io);
    });

    /* ------------ CHAT ------------ */
    socket.on("chat:send", ({ matchId, content }) => {
      if (!userId) return;
      const text = (content ?? "").toString().trim();
      if (!text) return;
      io.to(`room:${matchId}`).emit("chat:new", {
        matchId,
        userId,
        username,
        content: text,
        at: Date.now(),
      });
    });

    /* ------------ REPLAY ------------ */
    const votes = new Map<string, Set<string>>();
    socket.on("match:replayVote", async ({ matchId, accept }) => {
      if (!userId) return;
      if (!accept) {
        io.to(`room:${matchId}`).emit("match:replay:status", {
          matchId,
          status: "declined",
        });
        return;
      }
      let v = votes.get(matchId);
      if (!v) {
        v = new Set();
        votes.set(matchId, v);
      }
      v.add(userId);
      io.to(`room:${matchId}`).emit("match:replay:status", {
        matchId,
        status: "pending",
        voters: Array.from(v),
      });

      const m = await prisma.match.findUnique({ where: { id: matchId } });
      if (!m) return;
      const both = [m.p1Id, m.p2Id];
      if (both.every((uid) => v!.has(uid))) {
        const size = m.boardSize;
        const rows = size === 16 ? 4 : 6;
        const cols = size === 16 ? 4 : 6;
        const newRoom = await createRoom(m.p1Id, m.p2Id, rows, cols, 15);
        io.to(`room:${matchId}`).emit("match:replay:status", {
          matchId,
          status: "new",
          newMatchId: newRoom.id,
        });
        votes.delete(matchId);
      }
    });

    /* ------------ DISCONNECT ------------ */
    socket.on("disconnect", () => {
      presence.delete(socket.id);
      broadcastPresence(io);
    });
  });
}
