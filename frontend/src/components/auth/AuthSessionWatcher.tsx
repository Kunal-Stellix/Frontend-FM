"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { authLog, clearAuthSession, initializeAuthSession } from "@/api/client";
import {
  getStoredRefreshTokenExpiryInfo,
  hasStoredSession,
  subscribeToAuthSession,
} from "@/lib/authStorage";

const exactPublicRoutes = new Set(["/", "/ideas", "/roadmap", "/changelog", "/login"]);
const publicRoutePrefixes = ["/feedback/"];
const isPublicPath = (pathname: string) =>
  exactPublicRoutes.has(pathname) ||
  pathname === "/feedback" ||
  publicRoutePrefixes.some((prefix) => pathname.startsWith(prefix));

export function AuthSessionWatcher() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPath = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

  useEffect(() => {
    initializeAuthSession();
  }, []);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const clearExistingTimeout = () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const syncSessionExpiryTimer = () => {
      clearExistingTimeout();

      const refreshTokenExpiry = getStoredRefreshTokenExpiryInfo();

      if (!hasStoredSession()) return;

      if (refreshTokenExpiry.isExpired) {
        authLog("Refresh token expired, logging out");
        clearAuthSession();
        if (!isPublicPath(pathname)) router.replace(`/login?next=${encodeURIComponent(currentPath)}`);
        return;
      }

      if (
        typeof refreshTokenExpiry.expiresInSeconds === "number" &&
        refreshTokenExpiry.expiresInSeconds >= 0
      ) {
        timeoutId = setTimeout(() => {
          authLog("Refresh token expiry timer fired, logging out");
          clearAuthSession();
          if (!isPublicPath(pathname)) {
            router.replace(`/login?next=${encodeURIComponent(currentPath)}`);
          } else {
            router.refresh();
          }
        }, Math.max(refreshTokenExpiry.expiresInSeconds * 1000, 0));
      }
    };

    syncSessionExpiryTimer();
    const unsubscribe = subscribeToAuthSession(syncSessionExpiryTimer);

    return () => {
      clearExistingTimeout();
      unsubscribe();
    };
  }, [currentPath, pathname, router]);

  return null;
}
