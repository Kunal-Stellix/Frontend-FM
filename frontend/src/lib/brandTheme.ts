"use client";

import type { PortalSettings } from "@/types/admin";
import { MOCK_PORTAL_SETTINGS } from "@/lib/mockData";

const STORAGE_KEY = "fm.portal-settings";
const BRAND_EVENT = "fm:portal-settings-changed";

let cachedRawSettings: string | null = null;
let cachedSettings: PortalSettings = MOCK_PORTAL_SETTINGS;

const isBrowser = () => typeof window !== "undefined";

const isValidHexColor = (value: string | null | undefined) =>
  typeof value === "string" && /^#([0-9a-fA-F]{6})$/.test(value.trim());

const normalizePortalSettings = (
  parsed: Partial<PortalSettings> | null | undefined,
): PortalSettings => ({
  portalName: parsed?.portalName?.trim() || MOCK_PORTAL_SETTINGS.portalName,
  logoUrl: parsed?.logoUrl?.trim() || null,
  brandColor: isValidHexColor(parsed?.brandColor)
    ? parsed!.brandColor!.trim()
    : MOCK_PORTAL_SETTINGS.brandColor,
});

export const getDefaultPortalSettings = () => MOCK_PORTAL_SETTINGS;

export const getStoredPortalSettings = (): PortalSettings => {
  if (!isBrowser()) {
    return MOCK_PORTAL_SETTINGS;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRawSettings) {
    return cachedSettings;
  }

  if (!raw) {
    cachedRawSettings = null;
    cachedSettings = MOCK_PORTAL_SETTINGS;
    return cachedSettings;
  }

  try {
    cachedSettings = normalizePortalSettings(JSON.parse(raw) as Partial<PortalSettings>);
    cachedRawSettings = raw;
    return cachedSettings;
  } catch {
    cachedRawSettings = raw;
    cachedSettings = MOCK_PORTAL_SETTINGS;
    return cachedSettings;
  }
};

const emitPortalSettingsChange = () => {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(BRAND_EVENT));
};

export const savePortalSettings = (settings: PortalSettings) => {
  if (!isBrowser()) {
    return settings;
  }

  const normalized = normalizePortalSettings(settings);
  const raw = JSON.stringify(normalized);
  cachedRawSettings = raw;
  cachedSettings = normalized;
  window.localStorage.setItem(STORAGE_KEY, raw);
  emitPortalSettingsChange();
  return normalized;
};

export const subscribeToPortalSettings = (callback: () => void) => {
  if (!isBrowser()) {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    cachedRawSettings = event.newValue;
    cachedSettings = event.newValue
      ? normalizePortalSettings(JSON.parse(event.newValue) as Partial<PortalSettings>)
      : MOCK_PORTAL_SETTINGS;
    callback();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(BRAND_EVENT, callback);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(BRAND_EVENT, callback);
  };
};

export const applyBrandColor = (brandColor: string) => {
  if (!isBrowser()) return;
  document.documentElement.style.setProperty("--brand-color", brandColor);
};
