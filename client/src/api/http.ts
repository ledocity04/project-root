import axios from "axios";
import { useAuthStore } from "../store/auth";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:3001",
  withCredentials: false,
});

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(err);
  }
);
