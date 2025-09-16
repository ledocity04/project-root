import { randomInt } from "crypto";
import { prisma } from "../db/prisma.js";
import {
  allOpened,
  createShuffledBoard,
  isPairMatch,
} from "../domain/gameEngine.js";
import type { MatchState } from "../domain/types.js";
import { startTurnTimer, stopTurnTimer } from "./turnTimerService.js";
import { io } from "../socket.js";

type RoomMap = Map<string, MatchState>;
export const rooms: RoomMap = new Map(); // matchId -> state

function calcSize(rows: number, cols: number) {
  return rows * cols;
}

export async function createRoom(
  p1Id: string,
  p2Id: string,
  rows: number,
  cols: number,
  turnSeconds: number
) {
  const seed = randomInt(1, 2 ** 31);
  const board = createShuffledBoard(rows, cols, seed);
  const id = (
    await prisma.match.create({
      data: {
        p1Id,
        p2Id,
        boardSize: rows * cols,
      },
    })
  ).id;

  // random choose who starts
  const startUser = Math.random() < 0.5 ? p1Id : p2Id;
  const state: MatchState = {
    id,
    boardSize: rows * cols,
    rows,
    cols,
    seed,
    board,
    openedPairs: [],
    openedSet: new Set(),
    currentTurnUserId: startUser,
    players: [p1Id, p2Id],
    scores: { [p1Id]: 0, [p2Id]: 0 },
    flipBuffer: [],
    turnSeconds,
    turnDeadline: Date.now(),
    status: "ACTIVE",
  };
  rooms.set(id, state);

  // start timer
  const deadline = startTurnTimer(id, state.turnSeconds, {
    onTick: (remainingMs) => {
      io.to(`room:${id}`).emit("match:timer:tick", { remainingMs });
    },
    onTimeout: () => {
      handleTimeout(id);
    },
  });
  state.turnDeadline = deadline;

  return state;
}

export function getState(matchId: string) {
  return rooms.get(matchId) || null;
}

export function joinRoomSocket(matchId: string, socketId: string) {
  io.sockets.sockets.get(socketId)?.join(`room:${matchId}`);
}

function broadcastState(state: MatchState) {
  const {
    id,
    rows,
    cols,
    openedPairs,
    currentTurnUserId,
    scores,
    flipBuffer,
    turnDeadline,
    status,
  } = state;
  io.to(`room:${id}`).emit("match:state", {
    matchId: id,
    rows,
    cols,
    openedPairs,
    currentTurnUserId,
    scores,
    flipBuffer,
    deadline: turnDeadline,
    status,
  });
  io.to(`room:${id}`).emit("match:turn:update", {
    userId: currentTurnUserId,
    deadline: turnDeadline,
  });
}

export function handleFlip(matchId: string, userId: string, cardIndex: number) {
  const state = rooms.get(matchId);
  if (!state || state.status !== "ACTIVE")
    return { ok: false, code: "INVALID_MATCH" };
  if (userId !== state.currentTurnUserId)
    return { ok: false, code: "NOT_YOUR_TURN" };
  if (cardIndex < 0 || cardIndex >= state.board.length)
    return { ok: false, code: "INVALID_CARD" };
  if (state.openedSet.has(cardIndex))
    return { ok: false, code: "ALREADY_OPENED" };
  if (state.flipBuffer.includes(cardIndex))
    return { ok: false, code: "DUP_FLIP" };
  if (state.flipBuffer.length >= 2) return { ok: false, code: "BUFFER_FULL" };

  state.flipBuffer.push(cardIndex);
  io.to(`room:${matchId}`).emit("match:flip:ack", { cardIndex });

  return { ok: true };
}

export async function handleSendPair(matchId: string, userId: string) {
  const state = rooms.get(matchId);
  if (!state || state.status !== "ACTIVE")
    return { ok: false, code: "INVALID_MATCH" };
  if (userId !== state.currentTurnUserId)
    return { ok: false, code: "NOT_YOUR_TURN" };
  if (state.flipBuffer.length !== 2)
    return { ok: false, code: "NEED_TWO_FLIPS" };

  const [a, b] = state.flipBuffer;
  const matched = isPairMatch(state.board, a, b);

  if (matched) {
    state.openedPairs.push([a, b]);
    state.openedSet.add(a);
    state.openedSet.add(b);
    state.scores[userId] = (state.scores[userId] || 0) + 1;
    io.to(`room:${matchId}`).emit("match:pair:result", {
      result: "match",
      pair: [a, b],
      userId,
      scores: state.scores,
    });

    // same player continues — refresh timer
    const newDeadline = startTurnTimer(matchId, state.turnSeconds, {
      onTick: (remainingMs) =>
        io.to(`room:${matchId}`).emit("match:timer:tick", { remainingMs }),
      onTimeout: () => handleTimeout(matchId),
    });
    state.turnDeadline = newDeadline;

    state.flipBuffer = [];

    // end check
    if (allOpened(state.openedPairs, calcSize(state.rows, state.cols))) {
      await endMatchAndPersist(state);
    } else {
      broadcastState(state);
    }
    return { ok: true };
  } else {
    io.to(`room:${matchId}`).emit("match:pair:result", {
      result: "notMatch",
      pair: [a, b],
      userId,
    });

    // after 1–2s, auto hide (client only renders; state truth is openedSet/flipBuffer)
    setTimeout(() => {
      state.flipBuffer = [];
      switchTurn(state);
    }, 1200);

    return { ok: true };
  }
}

function switchTurn(state: MatchState) {
  const [p1, p2] = state.players;
  state.currentTurnUserId = state.currentTurnUserId === p1 ? p2 : p1;

  const newDeadline = startTurnTimer(state.id, state.turnSeconds, {
    onTick: (remainingMs) =>
      io.to(`room:${state.id}`).emit("match:timer:tick", { remainingMs }),
    onTimeout: () => handleTimeout(state.id),
  });
  state.turnDeadline = newDeadline;

  broadcastState(state);
}

async function handleTimeout(matchId: string) {
  const state = rooms.get(matchId);
  if (!state || state.status !== "ACTIVE") return;
  // clear buffer on timeout
  state.flipBuffer = [];
  io.to(`room:${matchId}`).emit("match:end-turn-timeout", {
    userId: state.currentTurnUserId,
  });
  switchTurn(state);
}

export async function endMatchAndPersist(state: MatchState) {
  if (state.status !== "ACTIVE") return;
  state.status = "FINISHED";
  stopTurnTimer(state.id);

  const [p1, p2] = state.players;
  const p1Score = state.scores[p1] || 0;
  const p2Score = state.scores[p2] || 0;
  const winnerId = p1Score === p2Score ? null : p1Score > p2Score ? p1 : p2;

  await prisma.match.update({
    where: { id: state.id },
    data: {
      finishedAt: new Date(),
      p1Score,
      p2Score,
      winnerId,
    },
  });

  // events snapshot
  await prisma.matchEvent.create({
    data: {
      matchId: state.id,
      type: "summary",
      payload: JSON.stringify({
        openedPairs: state.openedPairs,
        scores: state.scores,
        winnerId,
      }),
    },
  });

  // update user stats
  // (reuse in userService for DRY in thực tế; giữ đơn giản ở đây)
  await prisma.user.update({
    where: { id: p1 },
    data: {
      totalPoints: { increment: p1Score },
      totalCorrectPairs: { increment: p1Score },
      totalWins: { increment: winnerId === p1 ? 1 : 0 },
    },
  });
  await prisma.user.update({
    where: { id: p2 },
    data: {
      totalPoints: { increment: p2Score },
      totalCorrectPairs: { increment: p2Score },
      totalWins: { increment: winnerId === p2 ? 1 : 0 },
    },
  });

  io.to(`room:${state.id}`).emit("match:end", {
    winnerId,
    scores: state.scores,
  });
  // keep state for a short while then clean up
  setTimeout(() => rooms.delete(state.id), 60_000);
}

export async function playerExitMatch(matchId: string, userId: string) {
  const state = rooms.get(matchId);
  if (!state) return;
  if (state.status !== "ACTIVE") return;

  // Opponent wins if someone leaves
  const opponent = state.players.find((p) => p !== userId)!;
  state.scores[opponent] = (state.scores[opponent] || 0) + 0; // no change, but ensure key exists
  state.status = "FINISHED";
  stopTurnTimer(matchId);

  await prisma.match.update({
    where: { id: state.id },
    data: {
      finishedAt: new Date(),
      winnerId: opponent,
      p1Score: state.scores[state.players[0]] || 0,
      p2Score: state.scores[state.players[1]] || 0,
    },
  });

  io.to(`room:${state.id}`).emit("match:end", {
    winnerId: opponent,
    scores: state.scores,
  });
  setTimeout(() => rooms.delete(state.id), 60_000);
}
