import { Suspense } from "react";
import { AuthRedirect } from "@/components/auth/AuthRedirect";
import { RegisterView } from "@/components/auth/RegisterView";

export default function RegisterPage() {
  return (
    <Suspense>
      <AuthRedirect>
        <RegisterView />
      </AuthRedirect>
    </Suspense>
  );
}
