import axios, { AxiosError } from "axios";
import { useAuthStore } from "../store/auth";

// Lấy baseURL an toàn, có fallback
function resolveBaseURL() {
  // Vite sẽ inject biến env lúc build/dev
  // Dùng optional chaining + ép string để tránh TS kêu
  const envBase = (import.meta as any)?.env?.VITE_API_BASE as string | undefined;
  const base = envBase && envBase.trim().length > 0 ? envBase.trim() : "http://localhost:3001";
  // Chuẩn hoá: bỏ dấu "/" cuối để tránh "//api"
  return base.replace(/\/+$/, "");
}

export const http = axios.create({
  baseURL: resolveBaseURL(),
  // Nếu backend không dùng cookie, để false.
  withCredentials: false,
  // timeout nhẹ để tránh treo vô hạn
  timeout: 15000,
});

// Gắn token cho mọi request
http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    // Axios headers là Record<string, string>
    (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Xử lý lỗi chung
http.interceptors.response.use(
  (r) => r,
  (err: AxiosError<any>) => {
    const status = err.response?.status;

    // Nếu 401 → xoá token & điều hướng về login (nếu store có logout)
    if (status === 401) {
      try {
        useAuthStore.getState().logout?.();
      } catch {}
    }

    // Log gọn để dễ debug trong DevTools
    // eslint-disable-next-line no-console
    console.error("[HTTP ERROR]", {
      url: err.config?.url,
      method: err.config?.method,
      status,
      data: err.response?.data,
      message: err.message,
    });

    return Promise.reject(err);
  }
);
