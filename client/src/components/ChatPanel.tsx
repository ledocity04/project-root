import { FormEvent, useRef } from "react";
import { useMatchStore } from "../store/match";
import { useAuthStore } from "../store/auth";
import { sendChat } from "../sockets";

export default function ChatPanel() {
  const { chat, matchId } = useMatchStore();
  const me = useAuthStore((s) => s.user!);
  const ref = useRef<HTMLInputElement>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = ref.current?.value?.trim();
    if (!text) return;
    sendChat(matchId!, text);
    ref.current!.value = "";
  }

  return (
    <div className="rounded-xl border border-slate-700 p-4 flex flex-col h-64">
      <div className="font-semibold mb-2">Chat</div>
      <div className="flex-1 overflow-auto space-y-2 pr-1">
        {chat.map((m, idx) => (
          <div
            key={idx}
            className={`text-sm ${
              m.userId === me.id ? "text-emerald-400" : "text-slate-200"
            }`}
          >
            <span className="opacity-70 mr-2">
              {m.userId === me.id ? "Bạn:" : "Đối thủ:"}
            </span>
            {m.text}
          </div>
        ))}
      </div>
      <form onSubmit={onSubmit} className="mt-2 flex gap-2">
        <input
          ref={ref}
          className="flex-1 bg-slate-800 rounded px-2 py-1 border border-slate-700"
          placeholder="Nhập tin nhắn..."
        />
        <button className="px-3 py-1 rounded bg-indigo-600">Gửi</button>
      </form>
    </div>
  );
}
