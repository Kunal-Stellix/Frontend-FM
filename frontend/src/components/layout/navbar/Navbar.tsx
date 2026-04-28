"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FeedbackAvatar } from "@/components/ui";
import { getCurrentUser, logout, type UserResponse } from "@/api/auth";
import { initializeAuthSession } from "@/api/client";
import { hasStoredSession, subscribeToAuthSession } from "@/lib/authStorage";
import { mainNavItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

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
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const isAuthenticated = useSyncExternalStore(
    subscribeToAuthSession,
    hasStoredSession,
    () => false,
  );
  const feedbackCtaHref = isAuthenticated
    ? "/ideas?compose=1"
    : "/login?next=%2Fideas%3Fcompose%3D1";

  useEffect(() => {
    initializeAuthSession();
  }, [pathname]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let active = true;

    void getCurrentUser()
      .then((user) => {
        if (active) {
          setCurrentUser(user);
        }
      })
      .catch(() => {
        if (active) {
          setCurrentUser(null);
        }
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const handleLogout = async () => {
    setCurrentUser(null);
    await logout();
    router.replace("/login");
  };

  return (
    <header className="main-navbar-wrap">
      <nav className="main-navbar">
        <div className="main-navbar-brand-row">
          <Link href="/" className="main-navbar-brand">
            <span className="main-navbar-brand-mark" aria-hidden="true">
              FM
            </span>
            <span className="main-navbar-brand-copy">
              <span className="main-navbar-brand-title">Feedback</span>
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
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle p-1">
                  <FeedbackAvatar
                    name={currentUser?.name ?? "User account"}
                    initials={getInitials(currentUser?.name ?? "User account")}
                    size="sm"
                  />
                </div>
                <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                  {currentUser ? (
                    <li className="menu-title">
                      <span>{currentUser.name}</span>
                    </li>
                  ) : null}
                  <li><Link href="/dashboard">Dashboard</Link></li>
                  <li><Link href="/settings">Settings</Link></li>
                  <li><button className="text-error" onClick={handleLogout}>Logout</button></li>
                </ul>
              </div>
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
