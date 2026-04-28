"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { hasStoredSession } from "@/lib/authStorage";

export function AuthRedirect({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (hasStoredSession()) {
      router.replace(searchParams.get("next") || "/dashboard");
    }
  }, [router, searchParams]);

  return <>{children}</>;
}
