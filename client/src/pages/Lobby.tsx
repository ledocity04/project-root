import { useEffect, useState } from "react";
import { presenceList } from "../sockets";
import OnlineList from "../components/OnlineList";
import InviteModal from "../components/InviteModal";
import { useAuthStore } from "../store/auth";
import { usePresenceStore } from "../store/presence";
import { http } from "../api/http";

export default function Lobby() {
  const { user, logout } = useAuthStore();
  const { openInvite } = usePresenceStore();
  const [lb, setLb] = useState<any[]>([]);

  useEffect(() => {
    presenceList();
    const id = setInterval(() => presenceList(), 5_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    http
      .get("/api/leaderboard")
      .then((r) => setLb(r.data))
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lobby</h1>
        <div className="flex items-center gap-3">
          <div className="text-slate-300">
            Xin chào, <span className="font-semibold">{user?.username}</span>
          </div>
          <button onClick={logout} className="px-3 py-1 rounded bg-slate-700">
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="md:col-span-2">
          <h2 className="font-semibold mb-3">Người chơi online</h2>
          <OnlineList />
        </section>
        <section className="md:col-span-1">
          <h2 className="font-semibold mb-3">Leaderboard</h2>
          <div className="rounded-xl border border-slate-700 divide-y divide-slate-800">
            {lb.map((u) => (
              <div key={u.id} className="flex justify-between p-3">
                <span>{u.username}</span>
                <span className="text-emerald-400">{u.totalPoints}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <InviteModal />

      <div className="fixed bottom-6 right-6">
        <button
          onClick={() =>
            openInvite(prompt("Nhập userId đối thủ để mời:", "") || "")
          }
          className="px-4 py-2 rounded-full bg-indigo-600 shadow-lg"
        >
          Mời bằng userId
        </button>
      </div>
    </div>
  );
}
