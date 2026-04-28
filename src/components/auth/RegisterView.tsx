"use client";

import Link from "next/link";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/api/auth";
import { setAccessToken } from "@/api/client";
import { getStoredAccessToken, getStoredRefreshToken } from "@/lib/authStorage";
import { Mail, Lock, User, ArrowRight, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

type ApiErrorResponse = {
  detail?: string;
  message?: string;
};

export function RegisterView() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
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
      await register(formData);
      router.replace("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const message = axios.isAxiosError<ApiErrorResponse>(err)
        ? err.response?.data?.detail ?? err.response?.data?.message
        : undefined;
      setError(message || "Something went wrong. Please try again.");
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
                className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-primary-content shadow-lg shadow-primary/25 transition-transform hover:scale-110 hover:-rotate-3"
                aria-label="Feedback Management home"
              >
                <Sparkles className="w-6 h-6" />
              </Link>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-base-content tracking-tight">Feedback Management</p>
                <p className="text-xs text-base-content/50 font-semibold tracking-wider uppercase">Workspace Setup</p>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <h1 className="text-3xl font-extrabold tracking-tight text-base-content sm:text-4xl">
                Get started
              </h1>
              <p className="max-w-md text-sm leading-relaxed text-base-content/60 font-medium">
                Set up a workspace for ideas, priorities, and product updates.
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
                  Full name
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-4 w-5 h-5 text-base-content/30 transition-colors group-focus-within:text-primary z-10" />
                  <input
                    type="text"
                    placeholder="Ava Thompson"
                    className="input w-full pl-12 h-14 bg-base-200 border-base-300 focus:bg-base-100 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl text-base-content font-medium placeholder:text-base-content/30 transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-control gap-2 group">
                <label className="label-text font-semibold text-base-content/80 flex items-center gap-2">
                  Work email
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 w-5 h-5 text-base-content/30 transition-colors group-focus-within:text-primary z-10" />
                  <input
                    type="email"
                    placeholder="ava@company.com"
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
                    placeholder="Create a secure password"
                    className="input w-full pl-12 h-14 bg-base-200 border-base-300 focus:bg-base-100 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl text-base-content font-medium placeholder:text-base-content/30 transition-all"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2 text-sm">
                <label className="label cursor-pointer justify-start gap-3 p-0 group">
                  <input type="checkbox" className="checkbox checkbox-sm checkbox-primary rounded-md" required />
                  <span className="label-text text-base-content/60 font-medium group-hover:text-base-content transition-colors">
                    I agree to the terms and privacy policy
                  </span>
                </label>
              </div>

              <button
                className="btn btn-primary w-full h-14 text-base font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 border-0 mt-2"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create workspace
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <p className="pt-8 text-center text-sm text-base-content/60 font-medium">
              Already have access?{" "}
              <Link href="/login" className="font-bold text-primary hover:underline underline-offset-4 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </section>

        {/* ── Side Panel ── */}
        <aside className="auth-side-panel hidden lg:flex flex-col justify-center max-w-lg">
          <div className="inline-flex items-center w-fit px-4 py-2 rounded-full border border-secondary/20 bg-secondary/10 text-secondary font-bold text-sm tracking-wide mb-4">
            <Sparkles className="w-4 h-4 mr-2" /> Product Teams
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-extrabold tracking-tight text-base-content sm:text-5xl lg:text-6xl leading-[1.15]">
              Start with feedback. Ship with confidence.
            </h2>
            <p className="text-lg leading-relaxed text-base-content/60 font-medium">
              Collect customer requests, spot patterns, and share progress without adding process noise. Experience the premium way to build products.
            </p>
          </div>

          <ul className="mt-10 space-y-4 text-base-content/80 font-medium">
            <li className="flex items-center gap-4 bg-base-100 border border-base-300 p-4 rounded-2xl shadow-md shadow-base-content/5 transition-all duration-300 hover:translate-x-2 hover:shadow-lg">
              <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
              <span className="text-base">Capture ideas in one centralized place</span>
            </li>
            <li className="flex items-center gap-4 bg-base-100 border border-base-300 p-4 rounded-2xl shadow-md shadow-base-content/5 transition-all duration-300 hover:translate-x-2 hover:shadow-lg">
              <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
              <span className="text-base">Connect feedback directly to roadmap work</span>
            </li>
            <li className="flex items-center gap-4 bg-base-100 border border-base-300 p-4 rounded-2xl shadow-md shadow-base-content/5 transition-all duration-300 hover:translate-x-2 hover:shadow-lg">
              <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
              <span className="text-base">Publish beautiful updates as work ships</span>
            </li>
          </ul>
        </aside>
      </div>
    </main>
  );
}
