import { describe, it, expect } from "vitest";
import {
  buildDeck,
  createShuffledBoard,
  isPairMatch,
  lcg,
  shuffle,
} from "../src/domain/gameEngine.js";

describe("gameEngine", () => {
  it("buildDeck makes even pairs", () => {
    const d = buildDeck(4, 4); // 16
    expect(d.length).toBe(16);
    const counts: Record<number, number> = {};
    d.forEach((v) => (counts[v] = (counts[v] || 0) + 1));
    Object.values(counts).forEach((c) => expect(c).toBe(2));
  });

  it("shuffle with same seed is deterministic", () => {
    const deck = [0, 0, 1, 1, 2, 2, 3, 3];
    const s1 = shuffle(deck, lcg(123));
    const s2 = shuffle(deck, lcg(123));
    expect(s1).toEqual(s2);
  });

  it("isPairMatch validates equality", () => {
    const board = [0, 1, 0, 1];
    expect(isPairMatch(board, 0, 2)).toBe(true);
    expect(isPairMatch(board, 0, 1)).toBe(false);
    expect(isPairMatch(board, 1, 3)).toBe(true);
  });

  it("createShuffledBoard size matches", () => {
    const b = createShuffledBoard(6, 6, 42);
    expect(b.length).toBe(36);
  });
});
