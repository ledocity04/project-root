import { http } from "./http";

export type AuthResponse = {
  token: string;
  user: { id: string; username: string };
};

export async function signup(
  username: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await http.post("/api/auth/register", {
    username,
    password,
  });
  return data;
}

export async function login(
  username: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await http.post("/api/auth/login", { username, password });
  return data;
}
