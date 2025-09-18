import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

function resolveBaseURL() {
  const env = (import.meta as any)?.env?.VITE_API_BASE as string | undefined;
  const base = env?.trim() || "http://localhost:3001";
  return base.replace(/\/+$/, "");
}

export function getSocket(): Socket {
  if (!socket) {
    socket = io(resolveBaseURL(), {
      path: "/socket.io",
      transports: ["websocket"],
      autoConnect: true,
    });
  }
  return socket;
}

export async function ensureSocketConnected(): Promise<Socket> {
  const s = getSocket();
  if (s.connected) return s;
  return await new Promise((resolve, reject) => {
    const onConnect = () => {
      cleanup();
      resolve(s);
    };
    const onErr = (e: any) => {
      cleanup();
      reject(e);
    };
    const cleanup = () => {
      s.off("connect", onConnect);
      s.off("connect_error", onErr);
    };
    s.once("connect", onConnect);
    s.once("connect_error", onErr);
    s.connect();
  });
}

/* ----------------- Presence ----------------- */
export function presenceList() {
  const s = getSocket();
  if (!s?.connected) {
    console.warn("[socket] not connected yet; skip presence:list");
    return;
  }
  s.emit("presence:list");
}

/* ----------------- Invite ----------------- */
export function sendInvite(
  toUserId: string,
  rows = 4,
  cols = 4,
  turnSeconds = 20
) {
  const s = getSocket();
  if (!s?.connected) {
    console.warn("[socket] not connected yet; skip invite:send");
    return;
  }
  s.emit("invite:send", { toUserId, rows, cols, turnSeconds });
}

export function cancelInvite(inviteId: string) {
  const s = getSocket();
  if (!s?.connected) return;
  s.emit("invite:cancel", { inviteId });
}

export function respondInvite(inviteId: string, response: "accept" | "reject") {
  const s = getSocket();
  if (!s?.connected) return;
  s.emit("invite:respond", { inviteId, response });
}

/* ----------------- Match ----------------- */
export function joinMatch(matchId: string) {
  const s = getSocket();
  if (!s?.connected) return;
  s.emit("match:join", { matchId });
}

export function flipCard(matchId: string, cardIndex: number) {
  const s = getSocket();
  if (!s?.connected) return;
  s.emit("match:flip", { matchId, cardIndex });
}

export function sendPair(matchId: string) {
  const s = getSocket();
  if (!s?.connected) return;
  s.emit("match:sendPair", { matchId });
}

/* ----------------- Match Exit ----------------- */
export function exitMatch(matchId: string) {
  const s = getSocket();
  if (!s?.connected) return;
  s.emit("match:exit", { matchId });
}

/* ----------------- Match Replay Vote ----------------- */
export function replayVote(matchId: string, accept: boolean) {
  const s = getSocket();
  if (!s?.connected) return;
  s.emit("match:replayVote", { matchId, accept });
}

/* ----------------- Chat ----------------- */
export function sendChat(matchId: string, content: string) {
  const s = getSocket();
  if (!s?.connected) return;

  const text = (content ?? "").trim();
  if (!text) return;

  // CHỌN TÊN SỰ KIỆN PHÙ HỢP VỚI SERVER CỦA BẠN:
  // nếu server dùng "chat:send" thì giữ như dưới,
  // nếu server dùng "match:chat" thì đổi tên event tương ứng.
  s.emit("chat:send", { matchId, content: text });
}
