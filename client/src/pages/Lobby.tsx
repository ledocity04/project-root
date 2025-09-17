import { useEffect, useState } from "react";
import { presenceList, ensureSocketConnected } from "../sockets";
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
    let timer: any;
    (async () => {
      try {
        await ensureSocketConnected();
        presenceList();
        timer = setInterval(() => presenceList(), 5000);
      } catch (e) {
        console.error("Socket connect error:", e);
      }
    })();
    return () => timer && clearInterval(timer);
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
      </header>
      {/* TODO: render OnlineList, InviteModal, leaderboard, ... */}
      <InviteModal />
      <OnlineList />
    </div>
  );
}
