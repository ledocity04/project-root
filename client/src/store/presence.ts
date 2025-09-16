import { create } from "zustand";

export type PlayerPresence = {
  userId: string;
  username: string;
  status: "idle" | "busy";
  totalPoints?: number;
};

type InviteModalState = {
  open: boolean;
  toUserId: string | null;
};

type State = {
  players: PlayerPresence[];
  inviteModal: InviteModalState;
};
type Actions = {
  setPlayers: (ps: PlayerPresence[]) => void;
  openInvite: (toUserId: string) => void;
  closeInvite: () => void;
};

export const usePresenceStore = create<State & Actions>((set) => ({
  players: [],
  inviteModal: { open: false, toUserId: null },

  setPlayers: (ps) => set({ players: ps }),
  openInvite: (toUserId) => set({ inviteModal: { open: true, toUserId } }),
  closeInvite: () => set({ inviteModal: { open: false, toUserId: null } }),
}));
