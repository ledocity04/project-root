import { usePresenceStore } from "../store/presence";
import { sendInvite } from "../sockets";
import { useState } from "react";

export default function InviteModal() {
  const { inviteModal, closeInvite } = usePresenceStore();
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(4);
  const [turnSeconds, setTurnSeconds] = useState(15);

  if (!inviteModal.open || !inviteModal.toUserId) return null;

  return (
    <div className="fixed inset-0 bg-black/60 grid place-items-center z-50">
      <div className="bg-slate-800 rounded-xl p-6 w-[360px]">
        <h3 className="text-lg font-semibold mb-3">Mời đấu</h3>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <label className="col-span-1 text-sm text-slate-300">Rows</label>
          <input
            className="col-span-2 bg-slate-700 rounded px-2"
            type="number"
            value={rows}
            onChange={(e) => setRows(+e.target.value)}
          />
          <label className="col-span-1 text-sm text-slate-300">Cols</label>
          <input
            className="col-span-2 bg-slate-700 rounded px-2"
            type="number"
            value={cols}
            onChange={(e) => setCols(+e.target.value)}
          />
          <label className="col-span-1 text-sm text-slate-300">Turn (s)</label>
          <input
            className="col-span-2 bg-slate-700 rounded px-2"
            type="number"
            value={turnSeconds}
            onChange={(e) => setTurnSeconds(+e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={closeInvite}
            className="px-3 py-1 rounded bg-slate-700"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              sendInvite(inviteModal.toUserId!, rows, cols, turnSeconds);
              closeInvite();
            }}
            className="px-3 py-1 rounded bg-indigo-600"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}
