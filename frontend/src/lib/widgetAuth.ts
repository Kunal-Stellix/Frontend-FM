"use client";

import type { WidgetSession } from "@/types/widget";

const STORAGE_KEY = "fm.widget.session";
const SESSION_EVENT = "fm:widget-session-changed";

let cachedRawSession: string | null = null;
let cachedSession: WidgetSession | null = null;

const isBrowser = () => typeof window !== "undefined";

const normalizeSession = (parsed: Partial<WidgetSession> | null | undefined): WidgetSession | null => {
  if (!parsed?.token || !parsed?.userName || !parsed?.userEmail) return null;

  return {
    token: parsed.token,
    userName: parsed.userName,
    userEmail: parsed.userEmail,
    source: "url-token",
  };
};

export const getStoredWidgetSession = (): WidgetSession | null => {
  if (!isBrowser()) return null;

  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (raw === cachedRawSession) {
    return cachedSession;
  }

  if (!raw) {
    cachedRawSession = null;
    cachedSession = null;
    return null;
  }

  try {
    cachedSession = normalizeSession(JSON.parse(raw) as Partial<WidgetSession>);
    cachedRawSession = raw;
    return cachedSession;
  } catch {
    cachedRawSession = raw;
    cachedSession = null;
    return null;
  }
};

const emitSessionChange = () => {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(SESSION_EVENT));
};

export const saveWidgetSession = (session: WidgetSession | null) => {
  if (!isBrowser()) return session;

  cachedSession = session;
  cachedRawSession = session ? JSON.stringify(session) : null;

  if (session) {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    window.sessionStorage.removeItem(STORAGE_KEY);
  }

  emitSessionChange();
  return session;
};

export const subscribeToWidgetSession = (callback: () => void) => {
  if (!isBrowser()) return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    cachedRawSession = event.newValue;
    cachedSession = event.newValue
      ? normalizeSession(JSON.parse(event.newValue) as Partial<WidgetSession>)
      : null;
    callback();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(SESSION_EVENT, callback);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(SESSION_EVENT, callback);
  };
};
