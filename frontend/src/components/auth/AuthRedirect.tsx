"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./AuthProvider";

export function AuthRedirect({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isHydrated } = useAuth();

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (isAuthenticated) {
      const requestedNextPath = searchParams.get("next");
      const nextPath =
        requestedNextPath && requestedNextPath.startsWith("/") && !requestedNextPath.startsWith("//")
          ? requestedNextPath
          : "/";
      router.replace(nextPath);
    }
  }, [isAuthenticated, isHydrated, router, searchParams]);

  return <>{children}</>;
}
