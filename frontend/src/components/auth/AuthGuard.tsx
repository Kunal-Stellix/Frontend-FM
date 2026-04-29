"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

const publicRoutes = new Set(["/", "/ideas", "/feedback"]);

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublicRoute = publicRoutes.has(pathname);
  const { isAuthenticated, isHydrated } = useAuth();

  useEffect(() => {
    if (isPublicRoute || !isHydrated) {
      return;
    }

    if (!isAuthenticated) {
      const nextPath = encodeURIComponent(pathname);
      router.replace(`/login?next=${nextPath}`);
    }
  }, [isAuthenticated, isHydrated, isPublicRoute, pathname, router]);

  if (!isPublicRoute && (!isHydrated || !isAuthenticated)) {
    return null;
  }

  return <>{children}</>;
}
