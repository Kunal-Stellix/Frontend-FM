"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export default function SettingsPage() {
  const router = useRouter();
  const { currentUser, isLoadingUser, refreshCurrentUser, logout } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-12">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Account
        </p>
        <h1 className="text-3xl font-bold text-base-content">Settings</h1>
        <p className="max-w-2xl text-sm text-base-content/60">
          Your frontend account experience is now wired to the backend auth APIs for current user lookup, token-backed session refresh, and logout.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-base-content">Profile</h2>
              <p className="mt-1 text-sm text-base-content/60">
                Loaded from `GET /auth/me`.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoadingUser}
            >
              {isRefreshing || isLoadingUser ? "Refreshing..." : "Refresh profile"}
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-base-200/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">
                Name
              </p>
              <p className="mt-2 text-base font-semibold text-base-content">
                {currentUser?.name ?? "Loading..."}
              </p>
            </div>

            <div className="rounded-2xl bg-base-200/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">
                Email
              </p>
              <p className="mt-2 text-base font-semibold text-base-content">
                {currentUser?.email ?? "Loading..."}
              </p>
            </div>

            <div className="rounded-2xl bg-base-200/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">
                Role
              </p>
              <p className="mt-2 text-base font-semibold capitalize text-base-content">
                {currentUser?.role ?? "Loading..."}
              </p>
            </div>

            <div className="rounded-2xl bg-base-200/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">
                Joined
              </p>
              <p className="mt-2 text-base font-semibold text-base-content">
                {currentUser?.created_at ? formatDate(currentUser.created_at) : "Loading..."}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-base-content">Session</h2>
          <p className="mt-1 text-sm text-base-content/60">
            Logout calls `POST /auth/logout` and clears the local session state after the request completes.
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
