"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { hasStoredSession, subscribeToAuthSession } from "@/lib/authStorage";

const publicRoutes = new Set(["/", "/ideas", "/feedback"]);

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublicRoute = publicRoutes.has(pathname);
  const isAuthenticated = useSyncExternalStore(
    subscribeToAuthSession,
    hasStoredSession,
    () => false,
  );

  useEffect(() => {
    if (isPublicRoute) {
      return;
    }

    if (!isAuthenticated) {
      const nextPath = encodeURIComponent(pathname);
      router.replace(`/login?next=${nextPath}`);
    }
  }, [isAuthenticated, isPublicRoute, pathname, router]);

  if (!isPublicRoute && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
