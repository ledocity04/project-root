import { verifyToken } from "../services/authService.js";
import type { Socket } from "socket.io";

export function requireAuth(socket: Socket): string | null {
  const tokenHeader =
    socket.handshake.auth?.token || socket.handshake.headers.authorization;
  let token = tokenHeader;
  if (typeof token === "string" && token.startsWith("Bearer "))
    token = token.slice(7);

  if (!token || typeof token !== "string") {
    socket.emit("error", { code: "NO_TOKEN", message: "Missing token" });
    return null;
  }
  const userId = verifyToken(token);
  if (!userId) {
    socket.emit("error", { code: "INVALID_TOKEN", message: "Invalid token" });
    return null;
  }
  return userId;
}
