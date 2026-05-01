"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./AuthProvider";

const exactPublicRoutes = new Set(["/", "/ideas", "/roadmap", "/changelog"]);
const publicRoutePrefixes = ["/feedback/"];

const isPublicPath = (pathname: string) =>
  exactPublicRoutes.has(pathname) ||
  pathname === "/feedback" ||
  publicRoutePrefixes.some((prefix) => pathname.startsWith(prefix));

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPublicRoute = isPublicPath(pathname);
  const { isAuthenticated, isHydrated } = useAuth();
  const currentPath = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

  useEffect(() => {
    if (isPublicRoute || !isHydrated) {
      return;
    }

    if (!isAuthenticated) {
      const nextPath = encodeURIComponent(currentPath);
      router.replace(`/login?next=${nextPath}`);
    }
  }, [currentPath, isAuthenticated, isHydrated, isPublicRoute, router]);

  if (!isPublicRoute && (!isHydrated || !isAuthenticated)) {
    return null;
  }

  return <>{children}</>;
}
