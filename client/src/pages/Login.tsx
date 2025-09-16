import { useState } from "react";
import { useAuthStore } from "../store/auth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, signup, loading, error } = useAuthStore();

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

          {error && <div className="text-red-400 text-sm">{error}</div>}

          <div className="flex gap-2">
            <button
              disabled={loading}
              onClick={() => login(username, password)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 rounded px-3 py-2"
            >
              Đăng nhập
            </button>
            <button
              disabled={loading}
              onClick={() => signup(username, password)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 rounded px-3 py-2"
            >
              Đăng ký
            </button>
          </div>

          <div className="text-xs text-slate-400 mt-2">
            Server mặc định: http://localhost:3001
          </div>
        </div>
      </div>
    </div>
  );
}
