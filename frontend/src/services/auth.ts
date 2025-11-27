import { api } from "../lib/api-client";
import { User } from "../types";
import { authStore } from "../store/auth";

interface AuthResponse {
  access: string;
  refresh: string;
}

export const login = async (email: string, password: string) => {
  const { data } = await api.post<AuthResponse>("/api/users/auth/login", {
    email,
    password,
  });
  authStore.getState().setTokens(data.access, data.refresh);
  await fetchCurrentUser();
};

export const register = async (payload: {
  email: string;
  password: string;
  dorm_name: string;
  dorm_address?: string;
  role: "student" | "seller";
  phone?: string;
  iban?: string;
}) => {
  await api.post("/api/users/auth/register", payload);
  await login(payload.email, payload.password);
};

export const fetchCurrentUser = async () => {
  const { data } = await api.get<User>("/api/users/me");
  authStore.getState().setUser(data);
  return data;
};

