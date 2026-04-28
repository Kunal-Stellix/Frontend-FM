import { apiClient, clearAuthSession, setAccessToken, setRefreshToken } from "./client";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url: string | null;
  created_at: string;
};

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type AuthResponse = {
  user: AuthUser;
  tokens: AuthTokens;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type CurrentUserResponse = AuthUser;

export const applyAuthTokens = (tokens: Partial<AuthTokens> | null | undefined) => {
  if (!tokens?.access_token || !tokens.refresh_token) {
    clearAuthSession();
    return;
  }

  setAccessToken(tokens.access_token);
  setRefreshToken(tokens.refresh_token);
};

export const login = async (payload: LoginPayload) => {
  const response = await apiClient.post<AuthResponse>("/auth/login", payload);
  applyAuthTokens(response.data.tokens);
  return response.data;
};

export const register = async (payload: RegisterPayload) => {
  const response = await apiClient.post<AuthResponse>("/auth/register", payload);
  applyAuthTokens(response.data.tokens);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get<CurrentUserResponse>("/auth/me");
  return response.data;
};

export const logout = async () => {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    clearAuthSession();
  }
};
