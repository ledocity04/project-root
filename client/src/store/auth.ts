import { create } from "zustand";
import { http } from "../api/http";

type User = { id: string; username: string };

type State = {
  token: string | null;
  user: User | null;
  currentMatchId: string | null;
};
type Actions = {
  restore: () => void;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => void;
  enterMatch: (matchId: string) => void;
  leaveMatch: () => void;
};

export const useAuthStore = create<State & Actions>((set) => ({
  token: null,
  user: null,
  currentMatchId: null,

  restore: () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) set({ token, user: JSON.parse(user) });
  },

  login: async (username, password) => {
    const res = await http.post("/api/auth/login", { username, password });
    const { token, user } = res.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ token, user });
  },

  signup: async (username, password) => {
    const res = await http.post("/api/auth/signup", { username, password });
    const { token, user } = res.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: null, user: null, currentMatchId: null });
  },

  enterMatch: (matchId) => set({ currentMatchId: matchId }),
  leaveMatch: () => set({ currentMatchId: null }),
}));

export const me = () => useAuthStore.getState().user;
