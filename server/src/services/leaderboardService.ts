import { prisma } from "../db/prisma.js";

export async function topLeaderboard(limit = 50) {
  const users = await prisma.user.findMany({
    orderBy: [
      { totalPoints: "desc" },
      { totalCorrectPairs: "desc" },
      { totalWins: "desc" },
    ],
    take: limit,
  });
  return users.map((u) => ({
    id: u.id,
    username: u.username,
    totalPoints: u.totalPoints,
    totalCorrectPairs: u.totalCorrectPairs,
    totalWins: u.totalWins,
  }));
}
