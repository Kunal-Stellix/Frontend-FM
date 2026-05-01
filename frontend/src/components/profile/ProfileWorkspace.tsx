"use client";

import { Camera, Sparkles, UserRound } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { FeedbackAvatar } from "@/components/ui";
import {
  clearProfilePreferences,
  getDefaultProfilePreferences,
  getProfileAvatar,
  getProfileName,
  getStoredProfilePreferences,
  profileAvatarOptions,
  saveProfilePreferences,
  subscribeToProfilePreferences,
  type ProfilePreferences,
} from "@/lib/profilePreferences";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export function ProfileWorkspace() {
  const router = useRouter();
  const { currentUser, isLoadingUser, refreshCurrentUser, logout } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const savedPreferences = useSyncExternalStore(
    subscribeToProfilePreferences,
    getStoredProfilePreferences,
    getDefaultProfilePreferences,
  );
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!isSaved) return;

    const timeoutId = window.setTimeout(() => {
      setIsSaved(false);
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [isSaved]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshCurrentUser();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const hasCustomProfile =
    Boolean(savedPreferences.displayName) ||
    Boolean(savedPreferences.headline) ||
    savedPreferences.avatarId !== getDefaultProfilePreferences().avatarId;

  const handleProfileReset = () => {
    clearProfilePreferences();
    setIsSaved(false);
  };

  return (
    <section className="flex w-full flex-col gap-6">
      <div className="overflow-hidden rounded-[34px] border border-base-300/80 bg-gradient-to-br from-base-100 via-base-100 to-primary/10 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.45)]">
        <div className="grid gap-8 px-6 py-7 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:items-start">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Profile
            </div>
            <div className="space-y-3">
              <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-base-content sm:text-4xl">
                Your profile section, shaped around identity and account presence
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-base-content/65 sm:text-base">
                Manage how your account appears across the product, update your visible identity,
                and keep your session controls in one polished profile workspace.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <HeroMetric
              label="Profile email"
              value={currentUser?.email ?? "Loading..."}
              helper={currentUser?.role ?? "Loading..."}
              capitalizeHelper
            />
            <HeroMetric
              label="Profile status"
              value={hasCustomProfile ? "Customized" : "Default"}
              helper={
                hasCustomProfile
                  ? "Your local identity styling is active."
                  : "Using the shared default profile setup."
              }
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 ">
        <div className="rounded-[30px] border border-base-300/80 bg-base-100/95 p-6 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.5)] backdrop-blur sm:p-7">
          <div className="flex h-full flex-col">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  Profile Overview
                </p>
                <h2 className="text-2xl font-semibold text-base-content">Account identity</h2>
                <p className="max-w-xl text-sm leading-6 text-base-content/60">
                  These core profile details come from your authenticated account and stay synced
                  with the backend.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-outline btn-sm self-start border-base-300 bg-base-100/80"
                onClick={handleRefresh}
                disabled={isRefreshing || isLoadingUser}
              >
                {isRefreshing || isLoadingUser ? "Refreshing..." : "Refresh profile"}
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <InfoCard label="Name" value={currentUser?.name ?? "Loading..."} />
              <InfoCard label="Email" value={currentUser?.email ?? "Loading..."} />
              <InfoCard label="Role" value={currentUser?.role ?? "Loading..."} capitalize />
              <InfoCard
                label="Joined"
                value={currentUser?.created_at ? formatDate(currentUser.created_at) : "Loading..."}
              />
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-base-300/80 bg-gradient-to-br from-base-100 via-base-100 to-primary/5 p-6 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.5)] sm:p-7">
          <div className="flex h-full flex-col">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-[0.24em]">
                  Edit Profile
                </p>
              </div>
              <h2 className="text-2xl font-semibold text-base-content">Display identity</h2>
              <p className="text-sm leading-6 text-base-content/60">
                Refine the way your profile appears in the product with a cleaner avatar and
                display editor.
              </p>
            </div>

            <div className="mt-5 rounded-[28px] border border-base-300/70 bg-base-100/90 p-5 shadow-inner">
              <ProfileStudioForm
                key={JSON.stringify(savedPreferences)}
                currentUserName={currentUser?.name ?? ""}
                initialProfile={savedPreferences}
                onSave={() => setIsSaved(true)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div className="rounded-[30px] border border-base-300/80 bg-base-100/95 p-6 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.5)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Profile Actions
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-base-content">Profile tools</h2>
          <p className="mt-2 text-sm leading-6 text-base-content/60">
            Manage local profile preferences without changing your backend account record.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
            <button
              type="button"
              className="btn btn-ghost h-auto min-h-[88px] w-full justify-start rounded-[24px] border border-base-300/70 bg-base-100 px-5 py-4 text-left hover:border-primary/30 hover:bg-primary/5"
              onClick={handleProfileReset}
              disabled={!hasCustomProfile}
            >
              <span>
                <span className="block text-sm font-semibold text-base-content">
                  Reset profile style
                </span>
                <span className="mt-1 block text-xs font-normal text-base-content/55">
                  Revert your avatar, display name, and headline back to the default profile
                  state.
                </span>
              </span>
            </button>

            <div className="rounded-[24px] border border-base-300/70 bg-base-200/55 p-4 text-sm text-base-content/60">
              {isSaved ? "Profile style saved." : "Changes are stored on this device."}
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-base-300/80 bg-base-100/95 p-6 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.5)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Session
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-base-content">Profile session</h2>
          <p className="mt-2 text-sm leading-6 text-base-content/60">
            Sign out from your profile when you are done working or when switching devices.
          </p>

          <button
            type="button"
            className="btn btn-error mt-6 w-full"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </section>
  );
}

function InfoCard({
  label,
  value,
  capitalize = false,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="rounded-[24px] border border-base-300/70 bg-gradient-to-br from-base-100 to-base-200/40 p-5 shadow-inner">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-base-content/45">
        {label}
      </p>
      <p
        className={`mt-2 break-words text-base font-semibold text-base-content ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ProfileStudioForm({
  currentUserName,
  initialProfile,
  onSave,
}: {
  currentUserName: string;
  initialProfile: ProfilePreferences;
  onSave: () => void;
}) {
  const [draftProfile, setDraftProfile] = useState<ProfilePreferences>(initialProfile);
  const selectedAvatar = getProfileAvatar(draftProfile.avatarId);
  const previewName = getProfileName(
    currentUserName ? { name: currentUserName } : null,
    draftProfile,
  );

  const handleProfileSave = () => {
    saveProfilePreferences({
      displayName: draftProfile.displayName.trim(),
      headline: draftProfile.headline.trim(),
      avatarId: draftProfile.avatarId,
    });
    onSave();
  };

  return (
    <>
      <div className="rounded-[24px] border border-base-300/80 bg-gradient-to-r from-base-100 via-base-100 to-primary/5 p-4">
        <div className="flex items-center gap-4">
          <FeedbackAvatar
            name={previewName}
            imageUrl={selectedAvatar?.imageUrl}
            size="lg"
            className="avatar-ring avatar-ring-primary"
          />
          <div className="min-w-0">
            <p className="text-lg font-semibold text-base-content">{previewName}</p>
            <p className="truncate text-sm text-base-content/60">
              {draftProfile.headline.trim() || "Add a short headline for your profile."}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <label className="form-control rounded-[22px] border border-base-300/70 bg-base-100 p-4">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium text-base-content">
            <UserRound className="h-4 w-4 text-base-content/50" />
            Display name
          </span>
          <input
            type="text"
            className="input input-bordered w-full border-base-300 bg-base-100"
            placeholder={currentUserName || "Add your display name"}
            value={draftProfile.displayName}
            onChange={(event) =>
              setDraftProfile((current) => ({
                ...current,
                displayName: event.target.value,
              }))
            }
            maxLength={40}
          />
        </label>

        <label className="form-control rounded-[22px] border border-base-300/70 bg-base-100 p-4">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium text-base-content">
            <Sparkles className="h-4 w-4 text-base-content/50" />
            Headline
          </span>
          <input
            type="text"
            className="input input-bordered w-full border-base-300 bg-base-100"
            placeholder="Roadmap wrangler, idea gardener, chaos tamer..."
            value={draftProfile.headline}
            onChange={(event) =>
              setDraftProfile((current) => ({
                ...current,
                headline: event.target.value,
              }))
            }
            maxLength={60}
          />
        </label>
      </div>

      <div className="mt-4">
        <p className="mb-3 flex items-center gap-2 text-sm font-medium text-base-content">
          <Camera className="h-4 w-4 text-base-content/50" />
          Pick an avatar
        </p>
        <div className="grid grid-cols-3 gap-3">
          {profileAvatarOptions.map((avatar) => {
            const isActive = draftProfile.avatarId === avatar.id;

            return (
              <button
                key={avatar.id}
                type="button"
                className={`rounded-[20px] border p-2.5 text-center transition-all duration-200 ${
                  isActive
                    ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/20"
                    : "border-base-300 bg-base-100 hover:-translate-y-px hover:border-primary/40 hover:bg-primary/5"
                }`}
                onClick={() =>
                  setDraftProfile((current) => ({
                    ...current,
                    avatarId: avatar.id,
                  }))
                }
                aria-pressed={isActive}
              >
                <FeedbackAvatar
                  name={avatar.label}
                  imageUrl={avatar.imageUrl}
                  size="md"
                  className="mx-auto"
                />
                <span className="mt-2 block text-xs font-medium text-base-content">
                  {avatar.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          className="btn btn-primary min-w-40 shadow-[0_14px_30px_-18px_hsl(var(--p))]"
          onClick={handleProfileSave}
        >
          Save profile look
        </button>
      </div>
    </>
  );
}

function HeroMetric({
  label,
  value,
  helper,
  capitalizeHelper = false,
}: {
  label: string;
  value: string;
  helper: string;
  capitalizeHelper?: boolean;
}) {
  return (
    <div className="rounded-[26px] border border-base-300/70 bg-base-100/85 p-4 backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-base-content/45">
        {label}
      </p>
      <p className="mt-2 break-words text-base font-semibold text-base-content">{value}</p>
      <p className={`mt-1 text-sm text-base-content/55 ${capitalizeHelper ? "capitalize" : ""}`}>
        {helper}
      </p>
    </div>
  );
}
