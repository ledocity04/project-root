/**
 * Quản lý timer cho từng matchId:
 * - Đặt deadline (now+turnSeconds*1000)
 * - Tick 1s => callback tick
 * - Hết hạn => callback timeout
 */
type TimerCallbacks = {
  onTick: (remainingMs: number) => void;
  onTimeout: () => void;
};

type Entry = {
  interval?: NodeJS.Timeout;
  deadline: number;
  turnSeconds: number;
  cbs: TimerCallbacks;
};

const timers = new Map<string, Entry>(); // matchId -> Entry

export function startTurnTimer(
  matchId: string,
  turnSeconds: number,
  cbs: TimerCallbacks
) {
  stopTurnTimer(matchId);

  const deadline = Date.now() + turnSeconds * 1000;
  const entry: Entry = { deadline, turnSeconds, cbs };
  entry.interval = setInterval(() => {
    const remain = entry.deadline - Date.now();
    if (remain <= 0) {
      cbs.onTick(0);
      cbs.onTimeout();
      // Timeout will switch turn; new startTurnTimer call expected
      stopTurnTimer(matchId);
      return;
    }
    cbs.onTick(remain);
  }, 1000);

  timers.set(matchId, entry);
  return deadline;
}

export function refreshTurnTimer(matchId: string) {
  // extend to originally set turnSeconds from now
  const entry = timers.get(matchId);
  if (!entry) return 0;
  entry.deadline = Date.now() + entry.turnSeconds * 1000;
  return entry.deadline;
}

export function stopTurnTimer(matchId: string) {
  const entry = timers.get(matchId);
  if (entry?.interval) clearInterval(entry.interval);
  if (entry) timers.delete(matchId);
}
