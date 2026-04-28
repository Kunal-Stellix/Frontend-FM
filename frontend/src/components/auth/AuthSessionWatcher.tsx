"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authLog, clearAuthSession, initializeAuthSession } from "@/api/client";
import {
  getStoredRefreshTokenExpiryInfo,
  hasStoredSession,
  subscribeToAuthSession,
} from "@/lib/authStorage";

const publicRoutes = new Set(["/", "/ideas", "/feedback", "/login", "/register"]);

export function AuthSessionWatcher() {
  const pathname = usePathname();
  const router = useRouter();

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
        if (!publicRoutes.has(pathname)) router.replace("/login");
        return;
      }

      if (
        typeof refreshTokenExpiry.expiresInSeconds === "number" &&
        refreshTokenExpiry.expiresInSeconds >= 0
      ) {
        timeoutId = setTimeout(() => {
          authLog("Refresh token expiry timer fired, logging out");
          clearAuthSession();
          if (!publicRoutes.has(pathname)) {
            router.replace("/login");
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
  }, [pathname, router]);

  return null;
}
