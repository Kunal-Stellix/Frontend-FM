"use client";

import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login, register } from "@/api/auth";
import { setAccessToken } from "@/api/client";
import { getStoredAccessToken, getStoredRefreshToken } from "@/lib/authStorage";
import { ArrowRight, Loader2 } from "lucide-react";

type ApiErrorResponse = {
  detail?: string;
  message?: string;
};

type ActiveTab = "signin" | "signup";

export function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<ActiveTab>("signin");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextPath = searchParams.get("next") || "/dashboard";

  useEffect(() => {
    const accessToken = getStoredAccessToken();
    const refreshToken = getStoredRefreshToken();

    if (accessToken || refreshToken) {
      if (accessToken) {
        setAccessToken(accessToken);
      }
      router.replace(nextPath);
    }
  }, [nextPath, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(formData);
      router.replace(nextPath);
      router.refresh();
    } catch (err: unknown) {
      const message = axios.isAxiosError<ApiErrorResponse>(err)
        ? err.response?.data?.detail ?? err.response?.data?.message
        : undefined;
      setError(message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await register({
        name: signupData.username,
        email: signupData.email,
        password: signupData.password,
      });
      router.replace(nextPath);
      router.refresh();
    } catch (err: unknown) {
      const message = axios.isAxiosError<ApiErrorResponse>(err)
        ? err.response?.data?.detail ?? err.response?.data?.message
        : undefined;
      setError(message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen grid"
      style={{ gridTemplateColumns: "38% 62%", fontFamily: "'Inter', sans-serif" }}
    >
      {/* ══ LEFT PANEL ══ */}
      <div
        className="flex flex-col items-center justify-between px-8 py-10"
        style={{ background: "#1b3d35" }}
      >
        {/* Top spacer */}
        <div className="w-full" />

        {/* Illustration — replace the block below with your <img> */}
        <div className="flex-1 flex items-center justify-center w-full py-5">
          {/*]]
            REPLACE THIS ENTIRE <div> with:
            <img
              src="/your-illustration.png"
              alt="Platform illustration"
              style={{ width: "100%", maxWidth: "280px" }}
            />

            The Kolm design uses a black & white line-art illustration
            of hands holding a bell and card in front of a browser window.
          */}
          <Image
            src="/feedback%20illustration.png"
            alt="Roadmap illustration"
            width={280}
            height={280}
            style={{ width: "auto", maxWidth: "100%", height: "auto" }}
          />
        </div>

        {/* Bottom text + dots */}
        <div className="w-full text-center">
          {/* Replace text below with your actual copy */}
          <h2
            className="font-extrabold mb-3"
            style={{ fontSize: 18, color: "#fff", lineHeight: 1.3 }}
          >
            Designed for maximum efficiency
          </h2>
          <p
            className="mx-auto mb-5"
            style={{
              fontSize: 12.5,
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.75,
              maxWidth: 300,
            }}
          >
            Easily manage your feedback projects and files with your centralized platform.
            Our platform is designed for efficient communication between you and your team.
          </p>

          {/* Dot carousel indicators — wire to a real carousel if needed */}
          <div className="flex items-center justify-center gap-2">
            <div
              className="rounded-full"
              style={{ width: 8, height: 8, background: "#fff" }}
            />
            <div
              className="rounded-full"
              style={{ width: 8, height: 8, background: "rgba(255,255,255,0.35)" }}
            />
            <div
              className="rounded-full"
              style={{ width: 8, height: 8, background: "rgba(255,255,255,0.35)" }}
            />
          </div>
        </div>
      </div>

      {/* ══ RIGHT PANEL ══ */}
      <div
        className="flex flex-col justify-center"
        style={{ background: "#fff", padding: "48px 80px" }}
      >
        <div style={{ width: "100%", maxWidth: 480 }}>

          {/* Page title — replace "Feedback OS" with your product name */}
          <h1
            className="font-extrabold mb-7"
            style={{ fontSize: 26, color: "#111", letterSpacing: "-0.02em" }}
          >
            Sign in to Feedback OS
          </h1>

          {/* Google button */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 rounded-lg mb-6 transition-colors"
            style={{
              height: 52,
              background: "#fff",
              border: "1.5px solid #d1d5db",
              fontSize: 14.5,
              fontWeight: 500,
              color: "#111",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#f9fafb";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#fff";
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with <strong>Google</strong>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1" style={{ height: 1, background: "#e5e7eb" }} />
            <span style={{ fontSize: 13, color: "#9ca3af", whiteSpace: "nowrap" }}>
              or sign in with email
            </span>
            <div className="flex-1" style={{ height: 1, background: "#e5e7eb" }} />
          </div>

          {/* Sign In / Sign Up tabs */}
          <div
            className="flex mb-6"
            style={{ borderBottom: "1.5px solid #e5e7eb" }}
          >
            <button
              type="button"
              onClick={() => { setActiveTab("signin"); setError(null); }}
              className="mr-6 pb-2 transition-colors"
              style={{
                background: "none",
                border: "none",
                borderBottom: activeTab === "signin" ? "2.5px solid #111" : "2.5px solid transparent",
                marginBottom: -1.5,
                fontSize: 15,
                fontWeight: activeTab === "signin" ? 700 : 500,
                color: activeTab === "signin" ? "#111" : "#9ca3af",
                cursor: "pointer",
                letterSpacing: "-0.01em",
                paddingBottom: 8,
                paddingLeft: 0,
                paddingRight: 0,
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("signup"); setError(null); }}
              style={{
                background: "none",
                border: "none",
                borderBottom: activeTab === "signup" ? "2.5px solid #111" : "2.5px solid transparent",
                marginBottom: -1.5,
                fontSize: 15,
                fontWeight: activeTab === "signup" ? 700 : 500,
                color: activeTab === "signup" ? "#111" : "#9ca3af",
                cursor: "pointer",
                letterSpacing: "-0.01em",
                paddingBottom: 8,
                paddingLeft: 0,
                paddingRight: 0,
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Error bar */}
          {error && (
            <div
              className="rounded-lg mb-4"
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                padding: "10px 14px",
                fontSize: 13,
                color: "#dc2626",
              }}
            >
              {error}
            </div>
          )}

          {/* ── SIGN IN FORM ── */}
          {activeTab === "signin" && (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="si-email"
                  className="block mb-2"
                  style={{ fontSize: 13.5, fontWeight: 500, color: "#111" }}
                >
                  Username or email address{" "}
                  <span style={{ color: "#e8532a" }}>*</span>
                </label>
                <input
                  id="si-email"
                  type="email"
                  required
                  className="w-full rounded-lg outline-none transition-all"
                  style={{
                    height: 52,
                    background: "#f3f4f6",
                    border: "none",
                    padding: "0 16px",
                    fontSize: 14,
                    color: "#111",
                  }}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 0 2px rgba(232,83,42,0.18)";
                    e.currentTarget.style.background = "#eeeff1";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.background = "#f3f4f6";
                  }}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="si-pass"
                  className="block mb-2"
                  style={{ fontSize: 13.5, fontWeight: 500, color: "#111" }}
                >
                  Password <span style={{ color: "#e8532a" }}>*</span>
                </label>
                <input
                  id="si-pass"
                  type="password"
                  required
                  className="w-full rounded-lg outline-none transition-all"
                  style={{
                    height: 52,
                    background: "#f3f4f6",
                    border: "none",
                    padding: "0 16px",
                    fontSize: 14,
                    color: "#111",
                  }}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 0 2px rgba(232,83,42,0.18)";
                    e.currentTarget.style.background = "#eeeff1";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.background = "#f3f4f6";
                  }}
                />
              </div>

              <div className="flex items-center gap-3 mb-6" style={{ marginTop: 6 }}>
                <input
                  type="checkbox"
                  id="remember"
                  className="rounded"
                  style={{
                    width: 16,
                    height: 16,
                    accentColor: "#e8532a",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                />
                <label
                  htmlFor="remember"
                  style={{ fontSize: 13.5, color: "#374151", cursor: "pointer" }}
                >
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg font-bold transition-colors"
                style={{
                  height: 52,
                  background: loading ? "rgba(232,83,42,0.65)" : "#e8532a",
                  color: "#fff",
                  border: "none",
                  fontSize: 15,
                  letterSpacing: "-0.01em",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-center mt-5" style={{ fontSize: 13, color: "#6b7280" }}>
                <Link
                  href="#"
                  className="hover:underline underline-offset-4"
                  style={{ color: "#6b7280" }}
                >
                  Lost your password?
                </Link>
              </p>
            </form>
          )}

          {/* ── SIGN UP FORM ── */}
          {activeTab === "signup" && (
            <form onSubmit={handleSignup}>
              <div className="mb-4">
                <label
                  htmlFor="su-user"
                  className="block mb-2"
                  style={{ fontSize: 13.5, fontWeight: 500, color: "#111" }}
                >
                  Username <span style={{ color: "#e8532a" }}>*</span>
                </label>
                <input
                  id="su-user"
                  type="text"
                  required
                  className="w-full rounded-lg outline-none transition-all"
                  style={{
                    height: 52,
                    background: "#f3f4f6",
                    border: "none",
                    padding: "0 16px",
                    fontSize: 14,
                    color: "#111",
                  }}
                  value={signupData.username}
                  onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 0 2px rgba(232,83,42,0.18)";
                    e.currentTarget.style.background = "#eeeff1";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.background = "#f3f4f6";
                  }}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="su-email"
                  className="block mb-2"
                  style={{ fontSize: 13.5, fontWeight: 500, color: "#111" }}
                >
                  Email address <span style={{ color: "#e8532a" }}>*</span>
                </label>
                <input
                  id="su-email"
                  type="email"
                  required
                  className="w-full rounded-lg outline-none transition-all"
                  style={{
                    height: 52,
                    background: "#f3f4f6",
                    border: "none",
                    padding: "0 16px",
                    fontSize: 14,
                    color: "#111",
                  }}
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 0 2px rgba(232,83,42,0.18)";
                    e.currentTarget.style.background = "#eeeff1";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.background = "#f3f4f6";
                  }}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="su-pass"
                  className="block mb-2"
                  style={{ fontSize: 13.5, fontWeight: 500, color: "#111" }}
                >
                  Password <span style={{ color: "#e8532a" }}>*</span>
                </label>
                <input
                  id="su-pass"
                  type="password"
                  required
                  className="w-full rounded-lg outline-none transition-all"
                  style={{
                    height: 52,
                    background: "#f3f4f6",
                    border: "none",
                    padding: "0 16px",
                    fontSize: 14,
                    color: "#111",
                  }}
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 0 2px rgba(232,83,42,0.18)";
                    e.currentTarget.style.background = "#eeeff1";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.background = "#f3f4f6";
                  }}
                />
              </div>

              <p
                className="mb-5"
                style={{ fontSize: 11.5, color: "#9ca3af", lineHeight: 1.65 }}
              >
                Your personal data will be used to support your experience throughout this
                website, to manage access to your account, and for other purposes described
                in our{" "}
                <Link
                  href="/privacy-policy"
                  className="underline underline-offset-2"
                  style={{ color: "#6b7280" }}
                >
                  privacy policy
                </Link>
                .
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg font-bold transition-colors"
                style={{
                  height: 52,
                  background: loading ? "rgba(232,83,42,0.65)" : "#e8532a",
                  color: "#fff",
                  border: "none",
                  fontSize: 15,
                  letterSpacing: "-0.01em",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Sign Up
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </main>
  );
}
