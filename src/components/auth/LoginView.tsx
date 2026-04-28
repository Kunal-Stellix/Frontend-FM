"use client";

import Link from "next/link";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient, setAccessToken, setRefreshToken } from "@/lib/apiClient";
import { getStoredAccessToken, getStoredRefreshToken } from "@/lib/authStorage";
import { Mail, Lock, ArrowRight, Loader2, Sparkles } from "lucide-react";

type AuthResponse = {
  access_token?: string;
  refresh_token?: string;
};

type ApiErrorResponse = {
  message?: string;
};

export function LoginView() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = getStoredAccessToken();
    const refreshToken = getStoredRefreshToken();

    if (accessToken || refreshToken) {
      if (accessToken) {
        setAccessToken(accessToken);
      }

      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<AuthResponse>("/auth/login", formData);

      if (response.data?.access_token) {
        setAccessToken(response.data.access_token);
      }

      if (response.data?.refresh_token) {
        setRefreshToken(response.data.refresh_token);
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const message = axios.isAxiosError<ApiErrorResponse>(err)
        ? err.response?.data?.message
        : undefined;
      setError(message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell bg-base-200">
      {/* Decorative Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-primary/15 blur-[100px] rounded-full opacity-60 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-secondary/15 blur-[100px] rounded-full opacity-60 animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-[40%] left-[60%] w-[20vw] h-[20vw] bg-accent/10 blur-[80px] rounded-full opacity-40 animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      <div className="auth-shell-grid relative z-10">
        {/* ── Form Card ── */}
        <section className="card auth-form-card bg-base-100 shadow-2xl shadow-base-content/5 border border-base-300 rounded-3xl">
          <div className="card-body auth-form-body p-8 sm:p-10">
            <div className="flex items-center gap-4 mb-2">
              <Link
                href="/"
                className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-primary-content shadow-lg shadow-primary/25 transition-transform hover:scale-110 hover:rotate-3"
                aria-label="Feedback Management home"
              >
                <Sparkles className="w-6 h-6" />
              </Link>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-base-content tracking-tight">Feedback Management</p>
                <p className="text-xs text-base-content/50 font-semibold tracking-wider uppercase">Workspace Access</p>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <h1 className="text-3xl font-extrabold tracking-tight text-base-content sm:text-4xl">
                Welcome back
              </h1>
              <p className="max-w-md text-sm leading-relaxed text-base-content/60 font-medium">
                Continue managing feedback, roadmap decisions, and release updates.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="p-4 text-sm font-medium text-error bg-error/10 border border-error/20 rounded-xl flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-error animate-pulse shrink-0" />
                  {error}
                </div>
              )}

              <div className="form-control gap-2 group">
                <label className="label-text font-semibold text-base-content/80 flex items-center gap-2">
                  Email address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 w-5 h-5 text-base-content/30 transition-colors group-focus-within:text-primary z-10" />
                  <input
                    type="email"
                    placeholder="sarah@company.com"
                    className="input w-full pl-12 h-14 bg-base-200 border-base-300 focus:bg-base-100 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl text-base-content font-medium placeholder:text-base-content/30 transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-control gap-2 group">
                <label className="label-text font-semibold text-base-content/80 flex items-center gap-2">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 w-5 h-5 text-base-content/30 transition-colors group-focus-within:text-primary z-10" />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="input w-full pl-12 h-14 bg-base-200 border-base-300 focus:bg-base-100 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl text-base-content font-medium placeholder:text-base-content/30 transition-all"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                <label className="label cursor-pointer justify-start gap-3 p-0 group">
                  <input type="checkbox" className="checkbox checkbox-sm checkbox-primary rounded-md" />
                  <span className="label-text text-base-content/60 font-medium group-hover:text-base-content transition-colors">Keep me signed in</span>
                </label>
                <Link href="#" className="font-semibold text-primary hover:underline underline-offset-4 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button
                className="btn btn-primary w-full h-14 text-base font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 border-0"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="divider my-6 text-xs font-bold tracking-[0.2em] text-base-content/25 uppercase">
              Or continue with
            </div>

            <button
              className="btn btn-outline w-full h-14 text-base font-semibold rounded-2xl border-base-300 hover:bg-base-200 hover:border-base-content/20 transition-all flex items-center justify-center gap-3 text-base-content/70"
              type="button"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>

            <p className="pt-8 text-center text-sm text-base-content/60 font-medium">
              New here?{" "}
              <Link
                href="/register"
                className="font-bold text-primary hover:underline underline-offset-4 transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </section>

        {/* ── Side Panel ── */}
        <aside className="auth-side-panel hidden lg:flex flex-col justify-center max-w-lg">
          <div className="inline-flex items-center w-fit px-4 py-2 rounded-full border border-primary/20 bg-primary/10 text-primary font-bold text-sm tracking-wide mb-4">
            <Sparkles className="w-4 h-4 mr-2" /> Premium Feedback Hub
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-extrabold tracking-tight text-base-content sm:text-5xl lg:text-6xl leading-[1.15]">
              Turn customer signals into clear product work.
            </h2>
            <p className="text-lg leading-relaxed text-base-content/60 font-medium">
              Capture requests, prioritize ideas, and keep everyone aligned from one calm workspace. Build products your users actually want.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-5 w-full">
            <div className="bg-base-100 border border-base-300 p-6 rounded-3xl shadow-lg shadow-base-content/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group">
              <div className="text-4xl font-black text-primary mb-2 group-hover:scale-105 transition-transform origin-left">128+</div>
              <div className="text-sm font-bold text-base-content/50 uppercase tracking-wider">Ideas reviewed</div>
            </div>
            <div className="bg-base-100 border border-base-300 p-6 rounded-3xl shadow-lg shadow-base-content/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group">
              <div className="text-4xl font-black text-secondary mb-2 group-hover:scale-105 transition-transform origin-left">24</div>
              <div className="text-sm font-bold text-base-content/50 uppercase tracking-wider">Ready for roadmap</div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
