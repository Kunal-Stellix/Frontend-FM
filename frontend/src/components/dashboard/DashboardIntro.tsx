"use client";

import type { ReactNode } from "react";
import { LayoutDashboard, MessageSquareMore, UserRound } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

export function DashboardIntro({
  onSelectSection,
}: {
  onSelectSection?: (section: "profile" | "widgets") => void;
}) {
  const { currentUser } = useAuth();

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[32px] border border-base-300/80 bg-gradient-to-br from-base-100 via-base-100 to-primary/10 px-6 py-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] sm:px-8">
        <div className="inline-flex items-center rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Dashboard
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-base-content sm:text-5xl">
          Keep your account, profile, and feedback tools in one place
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-base-content/60 sm:text-lg">
          Use this dashboard window to move between your profile setup and widget-facing product
          surfaces without leaving the workspace.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard
          icon={<LayoutDashboard className="h-5 w-5" />}
          title="Signed-in account"
          description={currentUser?.email ?? "Your authenticated account is loading."}
          actionLabel={currentUser?.role ? `Role: ${currentUser.role}` : "Loading role"}
          disabled
        />
        <DashboardCard
          icon={<UserRound className="h-5 w-5" />}
          title="Profile"
          description="Update your display identity, avatar, and personal workspace preferences."
          actionLabel="Open profile"
          onClick={onSelectSection ? () => onSelectSection("profile") : undefined}
        />
        <DashboardCard
          icon={<MessageSquareMore className="h-5 w-5" />}
          title="Widgets"
          description="Preview the embedded feedback experience and public-facing workflow."
          actionLabel="Open widgets"
          onClick={onSelectSection ? () => onSelectSection("widgets") : undefined}
        />
      </div>
    </section>
  );
}

function DashboardCard({
  icon,
  title,
  description,
  actionLabel,
  onClick,
  disabled = false,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-[28px] border border-base-300/80 bg-base-100/95 p-5 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.5)]">
      <div className="inline-flex rounded-2xl bg-primary/10 p-3 text-primary">{icon}</div>
      <h2 className="mt-4 text-xl font-semibold text-base-content">{title}</h2>
      <p className="mt-2 min-h-[72px] text-sm leading-6 text-base-content/60">{description}</p>
      <button
        type="button"
        className="btn btn-outline mt-4"
        onClick={onClick}
        disabled={disabled || !onClick}
      >
        {actionLabel}
      </button>
    </div>
  );
}
