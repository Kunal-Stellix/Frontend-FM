import { Suspense } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Navbar } from "@/components/layout/navbar/Navbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <AuthGuard>
        <div className="flex min-h-full flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
        </div>
      </AuthGuard>
    </Suspense>
  );
}
