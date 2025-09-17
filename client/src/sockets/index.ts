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

export function presenceList() {
  const s = getSocket();
  if (!s?.connected) {
    console.warn("[socket] not connected yet; skip presence:list");
    return;
  }
  s.emit("presence:list");
}
export function sendInvite(toUserId: string) {
  const s = getSocket();
  if (!s?.connected) {
    console.warn("[socket] not connected yet; skip invite:send");
    return;
  }
  s.emit("invite:send", { toUserId });
}
