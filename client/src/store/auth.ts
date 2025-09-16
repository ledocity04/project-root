import { create } from "zustand";
import { apiLogin, apiSignup } from "../api/auth";

type User = { id: string; username: string };

type State = {
  token: string | null;
  user: User | null;
  currentMatchId: string | null; // dùng tạm cho "điều hướng" Room/Lobby
  loading: boolean;
  error: string | null;
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
  loading: false,
  error: null,

  restore: () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({ token, user });
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  },

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await apiLogin(username, password);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      set({ token, user, loading: false });
    } catch (e: any) {
      set({
        loading: false,
        error: e?.response?.data?.message || "Đăng nhập thất bại",
      });
    }
  },

  signup: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await apiSignup(username, password);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      set({ token, user, loading: false });
    } catch (e: any) {
      set({
        loading: false,
        error: e?.response?.data?.message || "Đăng ký thất bại",
      });
    }
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
