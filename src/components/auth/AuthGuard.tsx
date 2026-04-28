"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { hasStoredSession } from "@/lib/authStorage";

const publicRoutes = new Set(["/"]);

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (publicRoutes.has(pathname)) {
      return;
    }

    if (!hasStoredSession()) {
      router.replace("/login");
    }
  }, [pathname, router]);

  if (!publicRoutes.has(pathname) && !hasStoredSession()) {
    return null;
  }

  return <>{children}</>;
}
