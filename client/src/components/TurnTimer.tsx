import { useMatchStore } from "../store/match";
import { useAuthStore } from "../store/auth";
import { useMemo } from "react";

export default function TurnTimer() {
  const { timerRemainingMs, currentTurnUserId } = useMatchStore();
  const myId = useAuthStore((s) => s.user!.id);
  const secs = Math.max(0, Math.ceil(timerRemainingMs / 1000));
  const who = useMemo(
    () => (currentTurnUserId === myId ? "Lượt của bạn" : "Lượt đối thủ"),
    [currentTurnUserId, myId]
  );

  return (
    <div className="rounded-xl border border-slate-700 p-4">
      <div className="text-sm text-slate-400">{who}</div>
      <div className="text-3xl font-bold">{secs}s</div>
      <div className="mt-2 h-2 bg-slate-700 rounded">
        <div
          className="h-2 bg-emerald-600 rounded"
          style={{
            width: `${Math.min(100, (timerRemainingMs / 15000) * 100)}%`,
          }}
        />
      </div>
    </div>
  );
}
