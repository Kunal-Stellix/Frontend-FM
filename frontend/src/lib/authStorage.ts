const ACCESS_TOKEN_KEY = "fm_access_token";
const REFRESH_TOKEN_KEY = "fm_refresh_token";
const AUTH_SESSION_EVENT = "fm-auth-session-changed";

const canUseStorage = () => typeof window !== "undefined";
type AuthSessionListener = () => void;
const authSessionListeners = new Set<AuthSessionListener>();

const notifyAuthSessionChange = () => {
  authSessionListeners.forEach((listener) => listener());

  if (!canUseStorage()) {
    return;
  }

  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
};

const decodeJwtPayload = (token: string) => {
  try {
    const [, payload] = token.split(".");

    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      "=",
    );
    const decodedPayload = window.atob(paddedPayload);

    return JSON.parse(decodedPayload) as { exp?: number };
  } catch {
    return null;
  }
};

const getTokenExpiryTime = (token: string | null) => {
  if (!token || !canUseStorage()) {
    return null;
  }

  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    return null;
  }

  return payload.exp * 1000;
};

const isTokenExpired = (token: string | null) => {
  const expiryTime = getTokenExpiryTime(token);

  if (!expiryTime) {
    return false;
  }

  return expiryTime <= Date.now();
};

export const setStoredAccessToken = (token: string) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  notifyAuthSessionChange();
};

export const getStoredAccessToken = () => {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const setStoredRefreshToken = (token: string) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
  notifyAuthSessionChange();
};

export const getStoredRefreshToken = () => {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const clearStoredAccessToken = () => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  notifyAuthSessionChange();
};

export const clearStoredRefreshToken = () => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  notifyAuthSessionChange();
};

export const clearStoredTokens = () => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  notifyAuthSessionChange();
};

export const hasStoredAccessToken = () => Boolean(getStoredAccessToken());
export const hasStoredRefreshToken = () => Boolean(getStoredRefreshToken());
export const isStoredRefreshTokenExpired = () =>
  isTokenExpired(getStoredRefreshToken());
export const isStoredAccessTokenExpired = () =>
  isTokenExpired(getStoredAccessToken());
export const getTokenExpiryInfo = (token: string | null) => {
  const expiryTime = getTokenExpiryTime(token);

  if (!expiryTime) {
    return {
      expiresAt: null,
      expiresInSeconds: null,
      isExpired: false,
    };
  }

  return {
    expiresAt: new Date(expiryTime).toISOString(),
    expiresInSeconds: Math.floor((expiryTime - Date.now()) / 1000),
    isExpired: expiryTime <= Date.now(),
  };
};
export const getStoredAccessTokenExpiryInfo = () =>
  getTokenExpiryInfo(getStoredAccessToken());
export const getStoredRefreshTokenExpiryInfo = () =>
  getTokenExpiryInfo(getStoredRefreshToken());
export const hasStoredSession = () => {
  const refreshToken = getStoredRefreshToken();
  const accessToken = getStoredAccessToken();

  if (refreshToken) {
    return !isTokenExpired(refreshToken);
  }

  if (accessToken) {
    return !isTokenExpired(accessToken);
  }

  return false;
};

export const subscribeToAuthSession = (listener: AuthSessionListener) => {
  authSessionListeners.add(listener);

  if (canUseStorage()) {
    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === null ||
        event.key === ACCESS_TOKEN_KEY ||
        event.key === REFRESH_TOKEN_KEY
      ) {
        listener();
      }
    };
    const handleCustomEvent = () => listener();

    window.addEventListener("storage", handleStorage);
    window.addEventListener(AUTH_SESSION_EVENT, handleCustomEvent);

    return () => {
      authSessionListeners.delete(listener);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(AUTH_SESSION_EVENT, handleCustomEvent);
    };
  }

  return () => {
    authSessionListeners.delete(listener);
  };
};
