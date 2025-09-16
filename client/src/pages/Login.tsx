import { useState } from "react";
import { useAuthStore } from "../store/auth";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, signup } = useAuthStore();

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="w-[360px] bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h1 className="text-2xl font-bold mb-4">Flip Pairs Online</h1>
        <div className="space-y-3">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2"
          />
          <div className="flex gap-2">
            <button
              onClick={() => login(username, password)}
              className="flex-1 px-3 py-2 rounded bg-emerald-600"
            >
              Đăng nhập
            </button>
            <button
              onClick={() => signup(username, password)}
              className="flex-1 px-3 py-2 rounded bg-indigo-600"
            >
              Đăng ký
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-4">
          Server mặc định: http://localhost:3001
        </p>
      </div>
    </div>
  );
}
