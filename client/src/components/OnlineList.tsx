import { usePresenceStore } from "../store/presence";
import { sendInvite } from "../sockets";
import { useAuthStore } from "../store/auth";

export default function OnlineList() {
  const { players } = usePresenceStore();
  const me = useAuthStore((s) => s.user);
  const myId = me?.id;

  return (
    <div className="space-y-2">
      {players.map((p) => (
        <div
          key={p.userId}
          className="flex items-center justify-between rounded-lg border border-slate-700 p-3"
        >
          <div>
            <div className="font-semibold">{p.username}</div>
            <div className="text-sm text-slate-400">Trạng thái: {p.status}</div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded text-xs ${
                p.status === "idle" ? "bg-emerald-700" : "bg-slate-700"
              }`}
            >
              {p.status}
            </span>
            <button
              disabled={p.status !== "idle" || p.userId === myId}
              onClick={() => sendInvite(p.userId)}
              className="px-3 py-1 rounded bg-indigo-600 disabled:opacity-40"
            >
              Invite
            </button>
          </div>
        </div>
      ))}
      {players.length === 0 && (
        <div className="text-slate-400">Chưa có ai online…</div>
      )}
    </div>
  );
}
