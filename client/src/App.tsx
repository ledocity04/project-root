import { useEffect } from "react";
import { useAuthStore } from "./store/auth";
import Login from "./pages/Login";

// (tuỳ) nếu có Lobby/Room thì import, còn chưa có thì tạm trả Login/“Hello”
import Lobby from "./pages/Lobby";
import Room from "./pages/Room";

export default function App() {
  const { token, user, restore } = useAuthStore();

  useEffect(() => {
    restore();
  }, [restore]);

  // Chưa đăng nhập ⇒ render Login
  if (!token || !user) return <Login />;

  // Rất đơn giản: nếu đã vào trận thì render Room, ngược lại Lobby
  return <RouterLike />;
}

function RouterLike() {
  const { currentMatchId } = useAuthStore();
  return currentMatchId ? <Room /> : <Lobby />;
}
