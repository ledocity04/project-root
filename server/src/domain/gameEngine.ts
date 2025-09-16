/**
 * Thuần logic: sinh bộ bài, shuffle có seed, kiểm tra match, cập nhật state.
 * Không phụ thuộc IO/DB.
 */

export function lcg(seed: number) {
  // Linear congruential generator (deterministic)
  let s = seed >>> 0;
  return () => (s = (1664525 * s + 1013904223) >>> 0) / 0x100000000;
}

export function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildDeck(rows: number, cols: number): number[] {
  const size = rows * cols;
  if (size % 2 !== 0) throw new Error("Board size must be even");
  const pairs = size / 2;
  const deck: number[] = [];
  for (let i = 0; i < pairs; i++) {
    deck.push(i, i);
  }
  return deck;
}

export function createShuffledBoard(rows: number, cols: number, seed: number) {
  const deck = buildDeck(rows, cols);
  const rng = lcg(seed);
  const board = shuffle(deck, rng);
  return board;
}

export function isPairMatch(board: number[], i: number, j: number) {
  if (i === j) return false;
  if (i < 0 || j < 0 || i >= board.length || j >= board.length) return false;
  return board[i] === board[j];
}

export function allOpened(openedPairs: [number, number][], totalCards: number) {
  return openedPairs.length * 2 === totalCards;
}
