import { create } from "zustand";

export type MatchState = {
  matchId: string | null;
  rows: number;
  cols: number;
  openedPairs: [number, number][];
  flipBuffer: number[];
  currentTurnUserId: string | null;
  scores: Record<string, number>;
  deadline: number | null;
  status: "ACTIVE" | "FINISHED" | "ABORTED" | null;
  timerRemainingMs: number;
  endInfo?: { winnerId: string | null } | null;
  chat: { userId: string; text: string; ts: number }[];
};

type Actions = {
  reset: () => void;
  setState: (p: Partial<MatchState>) => void;
  pushChat: (m: { userId: string; text: string }) => void;
  setTimer: (ms: number) => void;
  setEnd: (winnerId: string | null, scores: Record<string, number>) => void;
};

export const useMatchStore = create<MatchState & Actions>((set) => ({
  matchId: null,
  rows: 0,
  cols: 0,
  openedPairs: [],
  flipBuffer: [],
  currentTurnUserId: null,
  scores: {},
  deadline: null,
  status: null,
  timerRemainingMs: 0,
  endInfo: null,
  chat: [],

  reset: () =>
    set({
      matchId: null,
      rows: 0,
      cols: 0,
      openedPairs: [],
      flipBuffer: [],
      currentTurnUserId: null,
      scores: {},
      deadline: null,
      status: null,
      timerRemainingMs: 0,
      endInfo: null,
      chat: [],
    }),

  setState: (p) => set((s) => ({ ...s, ...p })),
  pushChat: (m) =>
    set((s) => ({ chat: [...s.chat, { ...m, ts: Date.now() }] })),
  setTimer: (ms) => set({ timerRemainingMs: ms }),
  setEnd: (winnerId, scores) =>
    set({ endInfo: { winnerId }, status: "FINISHED", scores }),
}));
