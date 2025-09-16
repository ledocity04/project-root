import { useMatchStore } from "../store/match";
import { sendPair, exitMatch, replayVote } from "../sockets";
import { useAuthStore } from "../store/auth";
import { useMemo } from "react";

export default function Controls() {
  const { matchId, flipBuffer, currentTurnUserId, status, endInfo, scores } =
    useMatchStore();
  const my = useAuthStore((s) => s.user!);
  const isMyTurn = currentTurnUserId === my.id && status === "ACTIVE";
  const canSend = isMyTurn && flipBuffer.length === 2;

  const resultText = useMemo(() => {
    if (!endInfo) return "";
    if (endInfo.winnerId === null) return "Hòa!";
    return endInfo.winnerId === my.id ? "Bạn thắng!" : "Bạn thua!";
  }, [endInfo, my.id]);

  return (
    <div className="rounded-xl border border-slate-700 p-4 space-y-3">
      <button
        disabled={!canSend}
        onClick={() => sendPair(matchId!)}
        className="w-full px-4 py-2 rounded bg-emerald-600 disabled:opacity-40"
      >
        Send
      </button>
      <button
        onClick={() => exitMatch(matchId!)}
        className="w-full px-4 py-2 rounded bg-rose-600"
      >
        Thoát trận
      </button>

      {status === "FINISHED" && (
        <div className="p-3 rounded bg-slate-800 border border-slate-700">
          <div className="text-lg font-semibold mb-1">{resultText}</div>
          <div className="text-sm mb-2">
            Tỉ số: {Object.values(scores).join(" - ")}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => replayVote(matchId!, true)}
              className="flex-1 px-3 py-2 rounded bg-indigo-600"
            >
              Chơi tiếp
            </button>
            <button
              onClick={() => replayVote(matchId!, false)}
              className="flex-1 px-3 py-2 rounded bg-slate-700"
            >
              Từ chối
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
