"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FeedbackAvatar } from "@/components/ui";
import { useAuth } from "@/components/auth/AuthProvider";
import { mainNavItems } from "@/lib/navigation";
import {
  getDefaultProfilePreferences,
  getProfileAvatar,
  getProfileName,
  getStoredProfilePreferences,
  subscribeToProfilePreferences,
} from "@/lib/profilePreferences";
import {
  getDefaultPortalSettings,
  getStoredPortalSettings,
  subscribeToPortalSettings,
} from "@/lib/brandTheme";
import { cn } from "@/lib/utils";
import { NotificationBell } from "./NotificationBell";

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { currentUser, isAuthenticated, logout } = useAuth();
  const profilePreferences = useSyncExternalStore(
    subscribeToProfilePreferences,
    getStoredProfilePreferences,
    getDefaultProfilePreferences,
  );
  const portalSettings = useSyncExternalStore(
    subscribeToPortalSettings,
    getStoredPortalSettings,
    getDefaultPortalSettings,
  );
  const feedbackCtaHref = isAuthenticated
    ? "/ideas?compose=1"
    : "/login?next=%2Fideas%3Fcompose%3D1";
  const profileName = getProfileName(currentUser, profilePreferences);
  const profileAvatar = getProfileAvatar(profilePreferences.avatarId);
  const dashboardHref = currentUser?.role === "admin" ? "/admin/settings" : "/dashboard";
  const dashboardLabel = currentUser?.role === "admin" ? "Admin Dashboard" : "Dashboard";

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
    <header className="main-navbar-wrap">
      <nav className="main-navbar">
        <div className="main-navbar-brand-row">
          <Link href="/" className="main-navbar-brand">
            {portalSettings.logoUrl ? (
              <Image
                src={portalSettings.logoUrl}
                alt={`${portalSettings.portalName} logo`}
                width={44}
                height={44}
                unoptimized
                className="main-navbar-brand-logo"
              />
            ) : (
              <span
                className="main-navbar-brand-mark"
                aria-hidden="true"
                style={{ backgroundColor: portalSettings.brandColor }}
              >
                {portalSettings.portalName.slice(0, 2).toUpperCase()}
              </span>
            )}
            <span className="main-navbar-brand-copy">
              <span className="main-navbar-brand-title">{portalSettings.portalName}</span>
              <span className="main-navbar-brand-subtitle">Management system</span>
            </span>
          </Link>

          <div className="main-navbar-links" aria-label="Primary">
            {mainNavItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn("main-navbar-item", isActive && "main-navbar-item-active")}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="main-navbar-actions flex items-center gap-4">
            <Link href={feedbackCtaHref} className="btn btn-primary btn-sm">
              Give Feedback
            </Link>
            
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle p-1">
                  <FeedbackAvatar
                    name={profileName}
                    imageUrl={profileAvatar?.imageUrl}
                    initials={getInitials(profileName)}
                    size="sm"
                  />
                </div>
                <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                  {currentUser ? (
                    <li className="menu-title">
                      <span>{profileName}</span>
                    </li>
                  ) : null}
                  <li><Link href={dashboardHref}>{dashboardLabel}</Link></li>
                  <li><Link href="/profile">Profile</Link></li>
                  <li><Link href={dashboardHref}>Settings</Link></li>
                  <li>
                    <button className="text-error" onClick={handleLogout} disabled={isLoggingOut}>
                      {isLoggingOut ? "Logging out..." : "Logout"}
                    </button>
                  </li>
                </ul>
              </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="main-navbar-link-button">
                  Log in
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
