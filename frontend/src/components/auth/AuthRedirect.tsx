"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { hasStoredSession, subscribeToAuthSession } from "@/lib/authStorage";

export function AuthRedirect({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useSyncExternalStore(
    subscribeToAuthSession,
    hasStoredSession,
    () => false,
  );

  useEffect(() => {
    if (isAuthenticated) {
      const requestedNextPath = searchParams.get("next");
      const nextPath =
        requestedNextPath && requestedNextPath.startsWith("/") && !requestedNextPath.startsWith("//")
          ? requestedNextPath
          : "/";
      router.replace(nextPath);
    }
  }, [isAuthenticated, router, searchParams]);

  return <>{children}</>;
}
