import { AuthRedirect } from "@/components/auth/AuthRedirect";
import { LoginView } from "@/components/auth/LoginView";

export default function LoginPage() {
  return (
    <AuthRedirect>
      <LoginView />
    </AuthRedirect>
  );
}
