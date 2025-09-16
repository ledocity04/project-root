import { io as ioc, Socket } from "socket.io-client";
import { usePresenceStore } from "../store/presence";
import { useAuthStore } from "../store/auth";
import { useMatchStore } from "../store/match";

export let socket: Socket;

export function connectSocket(token: string) {
  if (socket?.connected) return socket;
  socket = ioc(import.meta.env.VITE_SOCKET_BASE || "http://localhost:3001", {
    transports: ["websocket"],
    autoConnect: true,
    auth: { token },
  });

  // Presence
  socket.on("presence:update", (data) => {
    usePresenceStore.getState().setPlayers(data.players);
  });

  // Invite result (accept -> goto match)
  socket.on("invite:result", ({ ok, matchId }) => {
    if (ok && matchId) {
      useAuthStore.getState().enterMatch(matchId);
      socket.emit("match:join", { matchId });
    }
  });

  // Invite received (simple confirm)
  socket.on(
    "invite:received",
    ({ inviteId, from, rows, cols, turnSeconds }) => {
      const ok = confirm(
        `${from.username} mời bạn chơi ${rows}x${cols}, ${turnSeconds}s/turn. Chấp nhận?`
      );
      socket.emit("invite:respond", {
        inviteId,
        response: ok ? "accept" : "reject",
      });
    }
  );

  // Match lifecycle
  socket.on("match:state", (s) => {
    useMatchStore.getState().setState({
      matchId: s.matchId,
      rows: s.rows,
      cols: s.cols,
      openedPairs: s.openedPairs,
      flipBuffer: s.flipBuffer,
      currentTurnUserId: s.currentTurnUserId,
      scores: s.scores,
      deadline: s.deadline,
      status: s.status,
    });
  });

  socket.on("match:turn:update", ({ userId, deadline }) => {
    useMatchStore.getState().setState({ currentTurnUserId: userId, deadline });
  });

  socket.on("match:timer:tick", ({ remainingMs }) => {
    useMatchStore.getState().setTimer(remainingMs);
  });

  socket.on("match:flip:ack", ({ cardIndex }) => {
    const ms = useMatchStore.getState();
    if (!ms.flipBuffer.includes(cardIndex)) {
      useMatchStore
        .getState()
        .setState({ flipBuffer: [...ms.flipBuffer, cardIndex] });
    }
  });

  socket.on("match:pair:result", ({ result, pair, userId, scores }) => {
    if (result === "match") {
      const st = useMatchStore.getState();
      useMatchStore.getState().setState({
        openedPairs: [...st.openedPairs, pair],
        flipBuffer: [],
        scores,
      });
    } else {
      // notMatch: keep temporary flips for ~1s (server will clear and switch turn)
      // here we just leave UI; state: flipBuffer will be reset by next match:state/turn update.
    }
  });

  socket.on("match:end", ({ winnerId, scores }) => {
    useMatchStore.getState().setEnd(winnerId, scores);
  });

  socket.on("match:replay:status", ({ status, newMatchId }) => {
    if (status === "new" && newMatchId) {
      useAuthStore.getState().enterMatch(newMatchId);
      socket.emit("match:join", { matchId: newMatchId });
    } else if (status === "declined") {
      alert("Đối thủ từ chối chơi tiếp.");
    }
  });

  // Chat
  socket.on("chat:message", ({ userId, text }) => {
    useMatchStore.getState().pushChat({ userId, text });
  });

  // Errors
  socket.on("error", (e) => {
    console.warn("Socket error", e);
  });

  return socket;
}

// Emits
export const presenceList = () => socket.emit("presence:list");
export const sendInvite = (
  toUserId: string,
  rows = 4,
  cols = 4,
  turnSeconds = 15
) => socket.emit("invite:send", { toUserId, rows, cols, turnSeconds });
export const joinMatch = (matchId: string) =>
  socket.emit("match:join", { matchId });
export const flipCard = (matchId: string, cardIndex: number) =>
  socket.emit("match:flip", { matchId, cardIndex });
export const sendPair = (matchId: string) =>
  socket.emit("match:sendPair", { matchId });
export const exitMatch = (matchId: string) =>
  socket.emit("match:exit", { matchId });
export const replayVote = (matchId: string, accept: boolean) =>
  socket.emit("match:replay:vote", { matchId, accept });
export const sendChat = (matchId: string, text: string) =>
  socket.emit("chat:send", { matchId, text });
