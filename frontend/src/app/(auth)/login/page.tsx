import { Suspense } from "react";
import { AuthRedirect } from "@/components/auth/AuthRedirect";
import { LoginView } from "@/components/auth/LoginView";

export default function LoginPage() {
  return (
    <Suspense>
      <AuthRedirect>
        <LoginView />
      </AuthRedirect>
    </Suspense>
  );
}
