import { prisma } from "../db/prisma.js";

export async function getMe(userId: string) {
  const u = await prisma.user.findUnique({ where: { id: userId } });
  if (!u) return null;
  return {
    id: u.id,
    username: u.username,
    totalPoints: u.totalPoints,
    totalWins: u.totalWins,
    totalCorrectPairs: u.totalCorrectPairs,
  };
}

export async function applyMatchResult(opts: {
  matchId: string;
  p1Id: string;
  p2Id: string;
  winnerId: string | null;
  p1Score: number;
  p2Score: number;
  boardSize: number;
}) {
  const { matchId, p1Id, p2Id, winnerId, p1Score, p2Score } = opts;

  await prisma.match.update({
    where: { id: matchId },
    data: {
      finishedAt: new Date(),
      winnerId,
      p1Score,
      p2Score,
    },
  });

  await prisma.user.update({
    where: { id: p1Id },
    data: {
      totalPoints: { increment: p1Score },
      totalCorrectPairs: { increment: p1Score },
      totalWins: { increment: winnerId === p1Id ? 1 : 0 },
    },
  });
  await prisma.user.update({
    where: { id: p2Id },
    data: {
      totalPoints: { increment: p2Score },
      totalCorrectPairs: { increment: p2Score },
      totalWins: { increment: winnerId === p2Id ? 1 : 0 },
    },
  });
}
