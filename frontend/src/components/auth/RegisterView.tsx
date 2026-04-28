"use client";

import Link from "next/link";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/api/auth";
import { initializeAuthSession } from "@/api/client";
import { Mail, Lock, User, ArrowLeft, ArrowRight, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

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
    const { accessToken, refreshToken } = initializeAuthSession();

    if (accessToken || refreshToken) {
      router.replace("/");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await register(formData);
      router.replace("/");
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[40vw] w-[40vw] rounded-full bg-primary/15 opacity-60 blur-[100px] animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40vw] w-[40vw] rounded-full bg-secondary/15 opacity-60 blur-[100px] animate-pulse" style={{ animationDuration: "10s" }} />
        <div className="absolute top-[40%] left-[60%] h-[20vw] w-[20vw] rounded-full bg-accent/10 opacity-40 blur-[80px] animate-pulse" style={{ animationDuration: "12s" }} />
      </div>

      <div className="auth-shell-grid relative z-10">
        <section className="card auth-form-card rounded-3xl border border-base-300 bg-base-100 shadow-2xl shadow-base-content/5">
          <div className="card-body auth-form-body p-8 sm:p-10">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-base-content/60 transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>

            <div className="mb-2 flex items-center gap-4">
              <Link
                href="/"
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-content shadow-lg shadow-primary/25 transition-transform hover:scale-110 hover:-rotate-3"
                aria-label="Feedback Management home"
              >
                <Sparkles className="h-6 w-6" />
              </Link>
              <div className="space-y-0.5">
                <p className="text-sm font-bold tracking-tight text-base-content">Feedback Management</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-base-content/50">Workspace Setup</p>
              </div>
            </div>

            <div className="mb-6 space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-base-content sm:text-4xl">
                Get started
              </h1>
              <p className="max-w-md text-sm font-medium leading-relaxed text-base-content/60">
                Create your account with email and password to start organizing ideas, priorities, and product updates.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error ? (
                <div className="flex items-center gap-3 rounded-xl border border-error/20 bg-error/10 p-4 text-sm font-medium text-error">
                  <div className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-error" />
                  {error}
                </div>
              ) : null}

              <div className="form-control gap-2 group">
                <label className="label-text flex items-center gap-2 font-semibold text-base-content/80">
                  Full name
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-4 z-10 h-5 w-5 text-base-content/30 transition-colors group-focus-within:text-primary" />
                  <input
                    type="text"
                    placeholder="Ava Thompson"
                    className="input h-14 w-full rounded-2xl border-base-300 bg-base-200 pl-12 font-medium text-base-content transition-all placeholder:text-base-content/30 focus:border-primary focus:bg-base-100 focus:ring-2 focus:ring-primary/20"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-control gap-2 group">
                <label className="label-text flex items-center gap-2 font-semibold text-base-content/80">
                  Work email
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 z-10 h-5 w-5 text-base-content/30 transition-colors group-focus-within:text-primary" />
                  <input
                    type="email"
                    placeholder="ava@company.com"
                    className="input h-14 w-full rounded-2xl border-base-300 bg-base-200 pl-12 font-medium text-base-content transition-all placeholder:text-base-content/30 focus:border-primary focus:bg-base-100 focus:ring-2 focus:ring-primary/20"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-control gap-2 group">
                <label className="label-text flex items-center gap-2 font-semibold text-base-content/80">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 z-10 h-5 w-5 text-base-content/30 transition-colors group-focus-within:text-primary" />
                  <input
                    type="password"
                    placeholder="Create a secure password"
                    className="input h-14 w-full rounded-2xl border-base-300 bg-base-200 pl-12 font-medium text-base-content transition-all placeholder:text-base-content/30 focus:border-primary focus:bg-base-100 focus:ring-2 focus:ring-primary/20"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2 text-sm">
                <label className="label group cursor-pointer justify-start gap-3 p-0">
                  <input type="checkbox" className="checkbox checkbox-primary checkbox-sm rounded-md" required />
                  <span className="label-text font-medium text-base-content/60 transition-colors group-hover:text-base-content">
                    I agree to the terms and privacy policy
                  </span>
                </label>
              </div>

              <button
                className="btn btn-primary mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-0 text-base font-bold shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-primary/30"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create workspace
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <p className="pt-8 text-center text-sm font-medium text-base-content/60">
              Already have access?{" "}
              <Link href="/login" className="font-bold text-primary transition-colors hover:underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>
        </section>

        <aside className="auth-side-panel hidden max-w-lg flex-col justify-center lg:flex">
          <div className="mb-4 inline-flex w-fit items-center rounded-full border border-secondary/20 bg-secondary/10 px-4 py-2 text-sm font-bold tracking-wide text-secondary">
            <Sparkles className="mr-2 h-4 w-4" /> Product Teams
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-extrabold leading-[1.15] tracking-tight text-base-content sm:text-5xl lg:text-6xl">
              Start with feedback. Ship with confidence.
            </h2>
            <p className="text-lg font-medium leading-relaxed text-base-content/60">
              Collect customer requests, spot patterns, and share progress without adding process noise. Experience the premium way to build products.
            </p>
          </div>

          <ul className="mt-10 space-y-4 font-medium text-base-content/80">
            <li className="flex items-center gap-4 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-md shadow-base-content/5 transition-all duration-300 hover:translate-x-2 hover:shadow-lg">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-primary" />
              <span className="text-base">Capture ideas in one centralized place</span>
            </li>
            <li className="flex items-center gap-4 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-md shadow-base-content/5 transition-all duration-300 hover:translate-x-2 hover:shadow-lg">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-primary" />
              <span className="text-base">Connect feedback directly to roadmap work</span>
            </li>
            <li className="flex items-center gap-4 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-md shadow-base-content/5 transition-all duration-300 hover:translate-x-2 hover:shadow-lg">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-primary" />
              <span className="text-base">Publish beautiful updates as work ships</span>
            </li>
          </ul>
        </aside>
      </div>
    </main>
  );
}
