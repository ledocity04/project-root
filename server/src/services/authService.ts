import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../db/prisma.js";
import { config } from "../config.js";

export async function signup(username: string, password: string) {
  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) throw new Error("USERNAME_TAKEN");
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username, passwordHash },
  });
  const token = signToken(user.id);
  return { user, token };
}

export async function login(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw new Error("INVALID_CREDENTIALS");
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error("INVALID_CREDENTIALS");
  const token = signToken(user.id);
  return { user, token };
}

export function signToken(userId: string) {
  return jwt.sign({ sub: userId }, config.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as any;
    return payload.sub as string;
  } catch {
    return null;
  }
}
