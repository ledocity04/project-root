import { useMatchStore } from "../store/match";
import { useAuthStore } from "../store/auth";

export default function ScorePanel() {
  const { scores } = useMatchStore();
  const me = useAuthStore((s) => s.user!);
  const opponentId =
    Object.keys(scores).find((id) => id !== me.id) || "opponent";
  const myScore = scores[me.id] || 0;
  const oppScore = scores[opponentId] || 0;

  return (
    <div className="rounded-xl border border-slate-700 p-4">
      <h3 className="font-semibold mb-2">Điểm</h3>
      <div className="flex justify-between text-lg">
        <div>
          {me.username}: <span className="font-bold">{myScore}</span>
        </div>
        <div>
          Đối thủ: <span className="font-bold">{oppScore}</span>
        </div>
      </div>
    </div>
  );
}
