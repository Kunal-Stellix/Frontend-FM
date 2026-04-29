import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AuthSessionWatcher } from "@/components/auth/AuthSessionWatcher";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Feedback Management System",
  description: "Manage and track user feedback, ideas, and roadmaps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable}`}>
      <body className="min-h-full font-sans">
        <AuthProvider>
          <AuthSessionWatcher />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
