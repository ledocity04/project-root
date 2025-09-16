import { create } from "zustand";
import { login as apiLogin, signup as apiSignup } from "../api/auth";

type User = { id: string; username: string };
type State = {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
};
type Actions = {
  login: (u: string, p: string) => Promise<void>;
  signup: (u: string, p: string) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<State & Actions>((set) => ({
  token: null,
  user: null,
  loading: false,
  error: null,

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await apiLogin(username, password);
      set({ token, user, loading: false });
    } catch (e: any) {
      set({
        error: e?.response?.data?.message || "Đăng nhập thất bại",
        loading: false,
      });
    }
  },

  signup: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await apiSignup(username, password);
      set({ token, user, loading: false });
    } catch (e: any) {
      set({
        error: e?.response?.data?.message || "Đăng ký thất bại",
        loading: false,
      });
    }
  },

  logout: () => set({ token: null, user: null }),
}));
