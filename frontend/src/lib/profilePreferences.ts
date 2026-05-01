"use client";

import type { UserResponse } from "@/api/auth";

export type ProfilePreferences = {
  displayName: string;
  headline: string;
  avatarId: string;
};

type ProfileAvatarOption = {
  id: string;
  label: string;
  imageUrl: string;
};

const STORAGE_KEY = "fm.profile.preferences";
const PROFILE_EVENT = "fm:profile-preferences-changed";

const svgToDataUrl = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const createAvatarSvg = ({
  emoji,
  bgStart,
  bgEnd,
  accent,
}: {
  emoji: string;
  bgStart: string;
  bgEnd: string;
  accent: string;
}) => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="avatar">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgStart}" />
        <stop offset="100%" stop-color="${bgEnd}" />
      </linearGradient>
    </defs>
    <rect width="96" height="96" rx="28" fill="url(#g)" />
    <circle cx="72" cy="24" r="10" fill="${accent}" opacity="0.85" />
    <circle cx="22" cy="74" r="8" fill="${accent}" opacity="0.55" />
    <text x="48" y="58" text-anchor="middle" font-size="34">${emoji}</text>
  </svg>
`;

export const profileAvatarOptions: ProfileAvatarOption[] = [
  {
    id: "rocket",
    label: "Rocket",
    imageUrl: svgToDataUrl(
      createAvatarSvg({
        emoji: "\u{1F680}",
        bgStart: "#1d4ed8",
        bgEnd: "#38bdf8",
        accent: "#fef08a",
      }),
    ),
  },
  {
    id: "cat",
    label: "Cat",
    imageUrl: svgToDataUrl(
      createAvatarSvg({
        emoji: "\u{1F431}",
        bgStart: "#f97316",
        bgEnd: "#fb7185",
        accent: "#fde68a",
      }),
    ),
  },
  {
    id: "spark",
    label: "Spark",
    imageUrl: svgToDataUrl(
      createAvatarSvg({
        emoji: "\u2728",
        bgStart: "#7c3aed",
        bgEnd: "#ec4899",
        accent: "#f9a8d4",
      }),
    ),
  },
  {
    id: "cool",
    label: "Cool",
    imageUrl: svgToDataUrl(
      createAvatarSvg({
        emoji: "\u{1F60E}",
        bgStart: "#0f766e",
        bgEnd: "#22c55e",
        accent: "#bbf7d0",
      }),
    ),
  },
  {
    id: "brain",
    label: "Brainy",
    imageUrl: svgToDataUrl(
      createAvatarSvg({
        emoji: "\u{1F9E0}",
        bgStart: "#be123c",
        bgEnd: "#fb7185",
        accent: "#fecdd3",
      }),
    ),
  },
  {
    id: "unicorn",
    label: "Unicorn",
    imageUrl: svgToDataUrl(
      createAvatarSvg({
        emoji: "\u{1F984}",
        bgStart: "#4338ca",
        bgEnd: "#a855f7",
        accent: "#ddd6fe",
      }),
    ),
  },
];

const defaultPreferences: ProfilePreferences = {
  displayName: "",
  headline: "",
  avatarId: profileAvatarOptions[0]?.id ?? "rocket",
};

let cachedRawPreferences: string | null = null;
let cachedPreferences: ProfilePreferences = defaultPreferences;

const isBrowser = () => typeof window !== "undefined";

const normalizeProfilePreferences = (
  parsed: Partial<ProfilePreferences> | null | undefined,
): ProfilePreferences => {
  const avatarId = profileAvatarOptions.some((option) => option.id === parsed?.avatarId)
    ? (parsed?.avatarId as string)
    : defaultPreferences.avatarId;

  return {
    displayName: parsed?.displayName?.trim() ?? "",
    headline: parsed?.headline?.trim() ?? "",
    avatarId,
  };
};

export const getDefaultProfilePreferences = () => defaultPreferences;

export const getStoredProfilePreferences = (): ProfilePreferences => {
  if (!isBrowser()) {
    return defaultPreferences;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (raw === cachedRawPreferences) {
    return cachedPreferences;
  }

  if (!raw) {
    cachedRawPreferences = null;
    cachedPreferences = defaultPreferences;
    return cachedPreferences;
  }

  try {
    cachedPreferences = normalizeProfilePreferences(
      JSON.parse(raw) as Partial<ProfilePreferences>,
    );
    cachedRawPreferences = raw;
    return cachedPreferences;
  } catch {
    cachedRawPreferences = raw;
    cachedPreferences = defaultPreferences;
    return cachedPreferences;
  }
};

const emitProfileChange = () => {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(PROFILE_EVENT));
};

export const saveProfilePreferences = (preferences: ProfilePreferences) => {
  if (!isBrowser()) {
    return;
  }

  const normalizedPreferences = normalizeProfilePreferences(preferences);
  const nextRaw = JSON.stringify(normalizedPreferences);

  cachedRawPreferences = nextRaw;
  cachedPreferences = normalizedPreferences;
  window.localStorage.setItem(STORAGE_KEY, nextRaw);
  emitProfileChange();
};

export const clearProfilePreferences = () => {
  if (!isBrowser()) {
    return;
  }

  cachedRawPreferences = null;
  cachedPreferences = defaultPreferences;
  window.localStorage.removeItem(STORAGE_KEY);
  emitProfileChange();
};

export const subscribeToProfilePreferences = (callback: () => void) => {
  if (!isBrowser()) {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cachedRawPreferences = event.newValue;
      cachedPreferences = event.newValue
        ? normalizeProfilePreferences(JSON.parse(event.newValue) as Partial<ProfilePreferences>)
        : defaultPreferences;
      callback();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(PROFILE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(PROFILE_EVENT, callback);
  };
};

export const getProfileAvatar = (avatarId: string | null | undefined) =>
  profileAvatarOptions.find((option) => option.id === avatarId) ?? profileAvatarOptions[0];

export const getProfileName = (
  user: Pick<UserResponse, "name"> | null,
  preferences: Pick<ProfilePreferences, "displayName">,
) => preferences.displayName.trim() || user?.name || "User account";
