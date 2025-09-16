export type UserPublic = {
  id: string;
  username: string;
  totalPoints: number;
  totalWins: number;
  totalCorrectPairs: number;
};

export type MatchId = string;

export type MatchState = {
  id: MatchId;
  boardSize: number; // e.g., 16 or 36
  rows: number;
  cols: number;
  seed: number;
  board: number[]; // shuffled deck, kept server-side
  openedPairs: [number, number][];
  openedSet: Set<number>;
  currentTurnUserId: string;
  players: [string, string]; // [p1Id, p2Id]
  scores: Record<string, number>;
  flipBuffer: number[]; // max length 2
  turnDeadline: number; // epoch ms
  turnSeconds: number; // per-turn timer (default 15)
  status: "ACTIVE" | "FINISHED" | "ABORTED";
};

export type Invite = {
  id: string;
  fromUserId: string;
  toUserId: string;
  rows: number;
  cols: number;
  turnSeconds: number;
  createdAt: number;
};
