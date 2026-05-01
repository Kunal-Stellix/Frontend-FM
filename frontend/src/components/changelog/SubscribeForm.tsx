"use client";

import { useState } from "react";
import { subscribeToChangelog } from "@/lib/feedbackApi";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";

export function SubscribeForm({ id }: { id?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setStatus("loading");
      await subscribeToChangelog(email);
      setStatus("success");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to subscribe");
    }
  };

  if (status === "success") {
    return (
      <div id={id} className="bg-success/10 border border-success/30 rounded-xl p-6 flex flex-col items-center justify-center text-center">
        <CheckCircle2 className="h-8 w-8 text-success mb-3" />
        <h3 className="font-bold text-success-content text-lg">You&apos;re subscribed!</h3>
        <p className="text-sm text-success-content/80 mt-1">
          We&apos;ll send you an email when we ship something new.
        </p>
        <button 
          onClick={() => setStatus("idle")} 
          className="btn btn-sm btn-ghost mt-4"
        >
          Subscribe another email
        </button>
      </div>
    );
  }

  return (
    <div id={id} className="bg-base-200/50 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Mail className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-bold text-lg text-base-content">Subscribe to updates</h3>
      </div>
      <p className="text-sm text-base-content/60 mb-6">
        Get notified when we release new features and improvements. No spam, promise.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          placeholder="your@email.com"
          className="input input-bordered flex-1 w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={status === "loading"}
        />
        <button 
          type="submit" 
          className="btn btn-primary w-full sm:w-auto"
          disabled={status === "loading" || !email}
        >
          {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
        </button>
      </form>
      
      {status === "error" && (
        <p className="text-error text-sm mt-3 font-medium">{errorMessage}</p>
      )}
    </div>
  );
}
