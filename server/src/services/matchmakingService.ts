import { randomUUID } from "crypto";
import type { Invite } from "../domain/types.js";

const invites = new Map<string, Invite>(); // inviteId -> Invite

export function createInvite(
  fromUserId: string,
  toUserId: string,
  rows: number,
  cols: number,
  turnSeconds: number
) {
  const id = randomUUID();
  const inv: Invite = {
    id,
    fromUserId,
    toUserId,
    rows,
    cols,
    turnSeconds,
    createdAt: Date.now(),
  };
  invites.set(id, inv);
  return inv;
}

export function getInvite(inviteId: string) {
  return invites.get(inviteId) || null;
}

export function cancelInvite(inviteId: string) {
  return invites.delete(inviteId);
}

export function consumeInvite(inviteId: string) {
  const inv = invites.get(inviteId) || null;
  if (inv) invites.delete(inviteId);
  return inv;
}
