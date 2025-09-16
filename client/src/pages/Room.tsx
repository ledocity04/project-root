import GameBoard from "../components/GameBoard";
import ScorePanel from "../components/ScorePanel";
import TurnTimer from "../components/TurnTimer";
import ChatPanel from "../components/ChatPanel";
import Controls from "../components/Controls";
import { useMatchStore } from "../store/match";
import { useAuthStore } from "../store/auth";
import { useEffect } from "react";
import { joinMatch } from "../sockets";

export default function Room() {
  const { matchId, rows, cols, status } = useMatchStore();
  const { leaveMatch } = useAuthStore();

  useEffect(() => {
    if (matchId) joinMatch(matchId);
  }, [matchId]);

  if (!matchId) return null;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Phòng đấu</h1>
        <button
          onClick={() => {
            leaveMatch();
          }}
          className="px-3 py-1 rounded bg-slate-700"
        >
          Về Lobby
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="md:col-span-2">
          <div className="mb-2 text-sm text-slate-400">
            Bàn: {rows} x {cols}
          </div>
          <GameBoard />
        </section>
        <aside className="md:col-span-1 space-y-4">
          <ScorePanel />
          <TurnTimer />
          <Controls />
          <ChatPanel />
        </aside>
      </div>

      {status === "ACTIVE" && (
        <div className="text-slate-400 text-xs">
          * Tip: Nút <b>Send</b> chỉ sáng khi bạn đã lật **2** lá.
        </div>
      )}
    </div>
  );
}
