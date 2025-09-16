import { useAuthStore } from "./store/auth";
import Login from "./pages/Login";
import Lobby from "./pages/Lobby";
import Room from "./pages/Room";
import { useEffect } from "react";
import { connectSocket, socket } from "./sockets";

export default function App() {
  const { token, user, restore } = useAuthStore();

  useEffect(() => {
    restore();
  }, [restore]);

  useEffect(() => {
    if (token) {
      connectSocket(token);
      socket.emit("auth:token"); // inform server after connect
    }
  }, [token]);

  if (!token || !user) return <Login />;

  // very simple "routing": if currentMatchId in match store -> Room, else Lobby
  // We let Room page listen to match store to render.
  return <RouterLike />;
}

function RouterLike() {
  const { currentMatchId } = useAuthStore(); // reuse auth store for lightweight nav
  return currentMatchId ? <Room /> : <Lobby />;
}
