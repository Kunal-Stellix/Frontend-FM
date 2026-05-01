"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Blocks,
  ChevronLeft,
  LayoutDashboard,
  Palette,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { AdminDashboardWorkspace } from "@/components/admin/dashboard/AdminDashboardWorkspace";
import { PortalSettingsForm } from "@/components/admin/settings/PortalSettingsForm";
import { AdminTeamWorkspace } from "@/components/admin/team/AdminTeamWorkspace";
import { DashboardIntro } from "@/components/dashboard/DashboardIntro";
import { ProfileWorkspace } from "@/components/profile/ProfileWorkspace";
import { WidgetShell } from "@/components/widget/WidgetShell";

type DashboardSection = "dashboard" | "general" | "profile" | "widgets" | "team";

export function DashboardWorkspaceShell({
  showAdminBackLink = false,
}: {
  showAdminBackLink?: boolean;
}) {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";
  const [activeSection, setActiveSection] = useState<DashboardSection>("dashboard");

  const navigationItems = useMemo(
    () =>
      [
        {
          id: "dashboard" as const,
          label: isAdmin ? "Admin Dashboard" : "Dashboard",
          icon: LayoutDashboard,
        },
        {
          id: "general" as const,
          label: "General settings",
          icon: Palette,
        },
        {
          id: "profile" as const,
          label: "Profile",
          icon: UserRound,
        },
        {
          id: "widgets" as const,
          label: "Widgets",
          icon: Blocks,
        },
        {
          id: "team" as const,
          label: "Team access",
          icon: ShieldCheck,
        },
      ] as const,
    [isAdmin],
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-base-100">
      <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-r border-base-300 bg-base-100">
          <div className="sticky top-0 flex max-h-[calc(100vh-4rem)] flex-col">
            <div className="border-b border-base-300 px-6 py-6">
              {showAdminBackLink ? (
                <Link
                  href="/admin"
                  className="btn btn-ghost btn-sm -ml-3 text-base-content/60 hover:text-base-content"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to Admin
                </Link>
              ) : null}

              <div className={showAdminBackLink ? "mt-5" : ""}>
                <p className="text-sm font-semibold text-base-content/55">Workspace</p>
                <p className="mt-1 text-lg font-semibold text-base-content">Dashboard</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5">
              <nav className="space-y-1.5">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveSection(item.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-base-200 text-base-content"
                          : "text-base-content/70 hover:bg-base-200/70 hover:text-base-content"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </aside>

        <main className="px-6 py-8 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-5xl">
            <SectionContent
              activeSection={activeSection}
              isAdmin={isAdmin}
              onSelectSection={setActiveSection}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

function SectionContent({
  activeSection,
  isAdmin,
  onSelectSection,
}: {
  activeSection: DashboardSection;
  isAdmin: boolean;
  onSelectSection: (section: DashboardSection) => void;
}) {
  if (activeSection === "dashboard") {
    return isAdmin ? (
      <AdminDashboardWorkspace />
    ) : (
      <DashboardIntro onSelectSection={onSelectSection} />
    );
  }

  if (activeSection === "general") {
    return (
      <div className="space-y-6">
        <div className="border-b border-base-300 pb-8">
          <h1 className="text-4xl font-bold tracking-tight text-base-content sm:text-5xl">
            General Settings
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-base-content/60">
            Manage your portal settings.
          </p>
        </div>
        <PortalSettingsForm />
      </div>
    );
  }

  if (activeSection === "profile") {
    return <ProfileWorkspace />;
  }

  if (activeSection === "widgets") {
    return <WidgetShell embedded />;
  }

  if (activeSection === "team") {
    return <AdminTeamWorkspace />;
  }

  return <DashboardIntro onSelectSection={onSelectSection} />;
}
