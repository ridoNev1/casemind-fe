import { apiClient } from "@/lib/api-client";
import type { AuthUser } from "@/store/auth-store";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: string;
  user: AuthUser;
};

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", payload);
  return data;
}
