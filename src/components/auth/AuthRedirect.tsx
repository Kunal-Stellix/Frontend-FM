"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasStoredSession } from "@/lib/authStorage";

export function AuthRedirect({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (hasStoredSession()) {
      router.replace("/dashboard");
    }
  }, [router]);

  return <>{children}</>;
}
