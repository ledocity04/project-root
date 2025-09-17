import { useMatchStore } from "../store/match";
import { useAuthStore } from "../store/auth";
import { flipCard, sendPair, joinMatch } from "../sockets";

type Props = {};
export default function GameBoard(_props: Props) {
  const {
    matchId,
    rows,
    cols,
    openedPairs,
    flipBuffer,
    currentTurnUserId,
    status,
  } = useMatchStore();
  const myId = useAuthStore((s) => s.user!.id);
  const isMyTurn = currentTurnUserId === myId && status === "ACTIVE";

  const size = rows * cols;
  const openedSet = new Set(openedPairs.flat());
  const grid = Array.from({ length: size }, (_, i) => i);

  function handleClick(i: number) {
    if (!isMyTurn) return;
    if (openedSet.has(i)) return;
    if (flipBuffer.includes(i)) return;
    if (flipBuffer.length >= 2) return;
    flipCard(matchId!, i);
  }

  return (
    <div
      className={`grid gap-2`}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {grid.map((i) => {
        const opened = openedSet.has(i);
        const tempOpened = flipBuffer.includes(i);
        const flipped = opened || tempOpened;
        return (
          <button
            key={i}
            className={`card ${flipped ? "flipped" : ""} ${
              opened ? "pointer-events-none" : ""
            } disabled:opacity-50`}
            onClick={() => handleClick(i)}
            disabled={!isMyTurn || opened}
            aria-label={`card-${i}`}
          >
            <div className="card-inner">
              <div
                className={`card-face card-front ${
                  opened ? "card-opened" : ""
                }`}
              >
                {/* Back face (hidden when flipped) */}?
              </div>
              <div
                className={`card-face card-back ${opened ? "card-opened" : ""}`}
              >
                {/* Front face (we don't show actual value to avoid leak; show index placeholder) */}
                {opened ? "✓" : i}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
