import { apiClient, authLog, clearAuthSession, setAccessToken, setRefreshToken } from "./client";

export type UserRole = "admin" | "moderator" | "member";

export type UserResponse = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type AuthResponse = {
  user: UserResponse;
  tokens: TokenResponse;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RefreshRequest = {
  refresh_token: string;
};

export type AccessTokenResponse = {
  access_token: string;
  token_type: string;
};

export const applyAuthTokens = (tokens: Partial<TokenResponse> | null | undefined) => {
  if (!tokens?.access_token || !tokens.refresh_token) {
    authLog("applyAuthTokens received incomplete token payload", {
      hasAccessToken: Boolean(tokens?.access_token),
      hasRefreshToken: Boolean(tokens?.refresh_token),
    });
    clearAuthSession();
    return;
  }

  authLog("Applying tokens from auth response", {
    tokenType: tokens.token_type ?? "unknown",
  });
  setAccessToken(tokens.access_token);
  setRefreshToken(tokens.refresh_token);
};

export const login = async (payload: LoginRequest) => {
  authLog("Clearing previous session before login", {
    email: payload.email,
  });
  clearAuthSession();
  authLog("Login request started", {
    email: payload.email,
  });
  const response = await apiClient.post<AuthResponse>("/auth/login", payload);
  applyAuthTokens(response.data.tokens);
  authLog("Login request succeeded", {
    userId: response.data.user.id,
    email: response.data.user.email,
  });
  return response.data;
};

export const register = async (payload: RegisterRequest) => {
  authLog("Register request started", {
    email: payload.email,
  });
  const response = await apiClient.post<AuthResponse>("/auth/register", payload);
  applyAuthTokens(response.data.tokens);
  authLog("Register request succeeded", {
    userId: response.data.user.id,
    email: response.data.user.email,
  });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get<UserResponse>("/auth/me");
  return response.data;
};

export const logout = async () => {
  try {
    authLog("Logout request started");
    await apiClient.post("/auth/logout");
  } finally {
    authLog("Logout completed, clearing session");
    clearAuthSession();
  }
};
