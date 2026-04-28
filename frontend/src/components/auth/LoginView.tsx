"use client";

import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login, register } from "@/api/auth";
import { initializeAuthSession } from "@/api/client";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

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
  const requestedNextPath = searchParams.get("next");
  const nextPath =
    requestedNextPath && requestedNextPath.startsWith("/") && !requestedNextPath.startsWith("//")
      ? requestedNextPath
      : "/";

  useEffect(() => {
    const { accessToken, refreshToken } = initializeAuthSession();

    if (accessToken || refreshToken) {
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
      <div
        className="flex flex-col items-center justify-between px-8 py-10"
        style={{ background: "#1b3d35" }}
      >
        <div className="w-full" />

        <div className="flex-1 flex items-center justify-center w-full py-5">
          <Image
            src="/feedback%20illustration.png"
            alt="Roadmap illustration"
            width={280}
            height={280}
            loading="eager"
            style={{ width: "auto", maxWidth: "100%", height: "auto" }}
          />
        </div>

        <div className="w-full text-center">
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

      <div
        className="flex flex-col justify-center"
        style={{ background: "#fff", padding: "48px 80px" }}
      >
        <div style={{ width: "100%", maxWidth: 480 }}>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-8 transition-colors hover:opacity-80"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#4b5563",
              letterSpacing: "-0.01em",
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <div className="mb-7">
            <h1
              className="font-extrabold"
              style={{ fontSize: 26, color: "#111", letterSpacing: "-0.02em" }}
            >
              Welcome to Feedback OS
            </h1>
            <p
              className="mt-3"
              style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, maxWidth: 420 }}
            >
              Sign in with your email to review ideas, capture feedback, and keep your team aligned.
            </p>
          </div>

          <div
            className="flex mb-6"
            style={{ borderBottom: "1.5px solid #e5e7eb" }}
          >
            <button
              type="button"
              onClick={() => {
                setActiveTab("signin");
                setError(null);
              }}
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
              onClick={() => {
                setActiveTab("signup");
                setError(null);
              }}
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

          <p
            className="mb-6"
            style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.7 }}
          >
            New here? Create an account with your work details to start collecting and managing feedback in one place.
          </p>

          {error ? (
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
          ) : null}

          {activeTab === "signin" ? (
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
          ) : (
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
