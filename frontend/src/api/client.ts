import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { env } from "@/config/env";
import { tokenConfig } from "@/config/tokenConfig";
import type { AccessTokenResponse, RefreshRequest } from "./auth";
import {
  clearStoredTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  getTokenExpiryInfo,
  getStoredAccessTokenExpiryInfo,
  getStoredRefreshTokenExpiryInfo,
  isStoredRefreshTokenExpired,
  setStoredAccessToken,
  setStoredRefreshToken,
} from "@/lib/authStorage";

const normalizeApiBaseUrl = (baseUrl: string) => {
  const trimmedBaseUrl = baseUrl.replace(/\/+$/, "");
  if (trimmedBaseUrl.endsWith("/api/v1")) return trimmedBaseUrl;
  if (trimmedBaseUrl.endsWith("/api")) return `${trimmedBaseUrl}/v1`;
  return `${trimmedBaseUrl}/api/v1`;
};

const apiBaseUrl = normalizeApiBaseUrl(env.NEXT_PUBLIC_API_URL);
const LOGIN_PATH = "/login";
const authHeaderExcludedPaths = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
]);

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});

const refreshClient = axios.create({
  baseURL: apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;
let proactiveRefreshTimerId: ReturnType<typeof setTimeout> | null = null;

// -- Logging ------------------------------------------------------------------

const getLogTimestamp = () => {
  const now = new Date();
  return {
    iso: now.toISOString(),
    local: now.toLocaleString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }),
  };
};

const summarizeToken = (token: string | null | undefined) => {
  if (!token) return "missing";
  if (token.length <= 12) return `${token.slice(0, 4)}...${token.slice(-2)}`;
  return `${token.slice(0, 6)}...${token.slice(-6)}`;
};

export const authLog = (message: string, details?: Record<string, unknown>) => {
  const timestamp = getLogTimestamp();
  console.log(`[auth ${timestamp.local}] ${message}`, {
    timestampIso: timestamp.iso,
    ...details,
  });
};

// -- Force logout -------------------------------------------------------------

const forceLogoutRedirect = (reason: string) => {
  authLog(`Force logout: ${reason}`);
  clearAuthSession();
  if (typeof window !== "undefined" && window.location.pathname !== LOGIN_PATH) {
    window.location.href = LOGIN_PATH;
  }
};

// -- Proactive refresh --------------------------------------------------------

const cancelProactiveRefresh = () => {
  if (proactiveRefreshTimerId !== null) {
    clearTimeout(proactiveRefreshTimerId);
    proactiveRefreshTimerId = null;
  }
};

const scheduleProactiveRefresh = () => {
  cancelProactiveRefresh();

  const token = accessToken ?? getStoredAccessToken();
  if (!token) return;

  const expiry = getTokenExpiryInfo(token);

  if (expiry.isExpired) {
    void refreshAccessToken();
    return;
  }

  if (typeof expiry.expiresInSeconds !== "number" || expiry.expiresInSeconds <= 0) {
    return;
  }

  const delaySeconds = Math.max(expiry.expiresInSeconds - tokenConfig.refreshBufferSeconds, 1);

  authLog("Proactive refresh scheduled", {
    expiresInSeconds: expiry.expiresInSeconds,
    bufferSeconds: tokenConfig.refreshBufferSeconds,
    refreshInSeconds: delaySeconds,
  });

  proactiveRefreshTimerId = setTimeout(async () => {
    proactiveRefreshTimerId = null;
    authLog("Proactive refresh timer fired");

    const nextToken = await refreshAccessToken();
    if (!nextToken) {
      forceLogoutRedirect("Proactive refresh failed");
    }
  }, delaySeconds * 1000);
};

// -- Token getters / setters --------------------------------------------------

export const setAccessToken = (token: string | null) => {
  accessToken = token;

  if (token) {
    const expiry = getTokenExpiryInfo(token);
    setStoredAccessToken(token);
    authLog("Access token updated", {
      accessToken: summarizeToken(token),
      expiresAt: expiry.expiresAt,
      expiresInSeconds: expiry.expiresInSeconds,
    });
    scheduleProactiveRefresh();
    return;
  }

  authLog("Access token cleared");
  cancelProactiveRefresh();
  clearStoredTokens();
};

export const getAccessToken = () => accessToken ?? getStoredAccessToken();
export const getRefreshToken = () => getStoredRefreshToken();

export const setRefreshToken = (token: string | null) => {
  if (token) {
    setStoredRefreshToken(token);
    const expiry = getTokenExpiryInfo(token);
    authLog("Refresh token updated", {
      refreshToken: summarizeToken(token),
      expiresAt: expiry.expiresAt,
      expiresInSeconds: expiry.expiresInSeconds,
    });
    return;
  }

  authLog("Refresh token cleared");
  clearStoredTokens();
};

export const clearAuthSession = () => {
  authLog("Clearing auth session");
  accessToken = null;
  cancelProactiveRefresh();
  clearStoredTokens();
};

export const initializeAuthSession = () => {
  if (isStoredRefreshTokenExpired()) {
    authLog("Refresh token expired at init, clearing session");
    clearAuthSession();
    return { accessToken: null, refreshToken: null };
  }

  const storedAccessToken = getStoredAccessToken();
  const storedRefreshToken = getStoredRefreshToken();

  authLog("Session initialized", {
    hasAccessToken: Boolean(storedAccessToken),
    hasRefreshToken: Boolean(storedRefreshToken),
    accessTokenExpiry: getStoredAccessTokenExpiryInfo(),
    refreshTokenExpiry: getStoredRefreshTokenExpiryInfo(),
  });

  accessToken = storedAccessToken;
  scheduleProactiveRefresh();

  return { accessToken: storedAccessToken, refreshToken: storedRefreshToken };
};

// -- Token refresh ------------------------------------------------------------

const requestTokenRefresh = async (refreshToken: string) =>
  refreshClient.post<AccessTokenResponse>("/auth/refresh", {
    refresh_token: refreshToken,
  } satisfies RefreshRequest);

const refreshAccessToken = async () => {
  if (isStoredRefreshTokenExpired()) {
    forceLogoutRedirect("Refresh token expired");
    return null;
  }

  const storedRefreshToken = getRefreshToken();
  if (!storedRefreshToken) {
    forceLogoutRedirect("Refresh token missing");
    return null;
  }

  if (!refreshPromise) {
    authLog("Refreshing access token");
    refreshPromise = requestTokenRefresh(storedRefreshToken)
      .then((response) => {
        const nextAccessToken = response.data?.access_token ?? null;
        if (!nextAccessToken) {
          authLog("Refresh response missing access token");
          clearAuthSession();
          return null;
        }
        setAccessToken(nextAccessToken);
        authLog("Access token refreshed", {
          accessTokenExpiry: getStoredAccessTokenExpiryInfo(),
          refreshTokenExpiry: getStoredRefreshTokenExpiryInfo(),
        });
        return nextAccessToken;
      })
      .catch((error: unknown) => {
        authLog("Access token refresh failed", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
        clearAuthSession();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

// -- Request interceptor ------------------------------------------------------

apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    const isAuthPath = config.url ? authHeaderExcludedPaths.has(config.url) : false;

    if (!isAuthPath && token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// -- Response interceptor (401 fallback) --------------------------------------

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || !error.config) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as RetryableRequestConfig;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== "undefined") {
        const nextAccessToken = await refreshAccessToken();

        if (nextAccessToken) {
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
          return apiClient(originalRequest);
        }

        forceLogoutRedirect("401 refresh failed");
      }
    }

    return Promise.reject(error);
  },
);
