const ACCESS_TOKEN_KEY = "fm_access_token";
const REFRESH_TOKEN_KEY = "fm_refresh_token";

const canUseStorage = () => typeof window !== "undefined";

export const setStoredAccessToken = (token: string) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
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
};

export const clearStoredRefreshToken = () => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const clearStoredTokens = () => {
  clearStoredAccessToken();
  clearStoredRefreshToken();
};

export const hasStoredAccessToken = () => Boolean(getStoredAccessToken());
export const hasStoredRefreshToken = () => Boolean(getStoredRefreshToken());
export const hasStoredSession = () =>
  hasStoredAccessToken() || hasStoredRefreshToken();
