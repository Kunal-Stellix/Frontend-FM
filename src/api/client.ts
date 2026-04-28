import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { env } from "@/config/env";
import {
  clearStoredTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredAccessToken,
  setStoredRefreshToken,
} from "@/lib/authStorage";

const normalizeApiBaseUrl = (baseUrl: string) => {
  const trimmedBaseUrl = baseUrl.replace(/\/+$/, "");

  if (trimmedBaseUrl.endsWith("/api/v1")) {
    return trimmedBaseUrl;
  }

  if (trimmedBaseUrl.endsWith("/api")) {
    return `${trimmedBaseUrl}/v1`;
  }

  return `${trimmedBaseUrl}/api/v1`;
};

const apiBaseUrl = normalizeApiBaseUrl(env.NEXT_PUBLIC_API_URL);

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;

  if (token) {
    setStoredAccessToken(token);
    return;
  }

  clearStoredTokens();
};

export const getAccessToken = () => accessToken ?? getStoredAccessToken();
export const getRefreshToken = () => getStoredRefreshToken();

export const setRefreshToken = (token: string | null) => {
  if (token) {
    setStoredRefreshToken(token);
    return;
  }

  clearStoredTokens();
};

export const clearAuthSession = () => {
  accessToken = null;
  clearStoredTokens();
};

type RefreshResponse = {
  access_token?: string;
  refresh_token?: string;
};

const requestTokenRefresh = async (refreshToken: string) =>
  refreshClient.post<RefreshResponse>("/auth/refresh", {
    refresh_token: refreshToken,
  });

const refreshAccessToken = async () => {
  const storedRefreshToken = getRefreshToken();

  if (!storedRefreshToken) {
    clearAuthSession();
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = requestTokenRefresh(storedRefreshToken)
      .then((response) => {
        const nextAccessToken = response.data?.access_token ?? null;
        const nextRefreshToken = response.data?.refresh_token ?? storedRefreshToken;

        if (!nextAccessToken) {
          clearAuthSession();
          return null;
        }

        setAccessToken(nextAccessToken);
        setRefreshToken(nextRefreshToken);
        return nextAccessToken;
      })
      .catch(() => {
        clearAuthSession();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

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

        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);
