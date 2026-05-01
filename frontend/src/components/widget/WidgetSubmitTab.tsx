"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { Category } from "@/types/idea";
import { submitIdea } from "@/lib/feedbackApi";
import { hasStoredSession } from "@/lib/authStorage";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function WidgetSubmitTab({
  categories,
  hasWidgetSession,
}: {
  categories: Category[];
  hasWidgetSession: boolean;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) return;

    try {
      setStatus("submitting");

      if (hasStoredSession()) {
        await submitIdea({
          title: title.trim(),
          description: description.trim() || undefined,
          categoryId: categoryId || null,
        });
      } else {
        await sleep(450);
      }

      setTitle("");
      setDescription("");
      setCategoryId("");
      setStatus("success");
      setMessage(
        hasWidgetSession
          ? "Widget request captured in placeholder SSO mode until backend widget submission is wired."
          : "Request captured in the placeholder widget flow.",
      );
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to submit from the widget.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-base-content">Capture feedback quickly</h2>
        <p className="text-sm text-base-content/60">
          This compact form mirrors the main submit flow while backend widget APIs are pending.
        </p>
        {!hasStoredSession() ? (
          <p className="mt-2 text-xs text-base-content/50">
            Placeholder mode: this widget can still collect demo submissions even without a real app
            session.
          </p>
        ) : null}
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-base-content">Title</span>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="input input-bordered h-12 w-full rounded-2xl"
          placeholder="What should we build next?"
          required
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-base-content">Context</span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="textarea textarea-bordered min-h-32 w-full rounded-2xl text-sm leading-6"
          placeholder="Add a little context so the team understands the request."
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-base-content">Topic</span>
        <select
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          className="select select-bordered h-12 w-full rounded-2xl"
        >
          <option value="">Choose a topic</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </label>

      <div className="pt-1">
        <button
          type="submit"
          className="btn w-full rounded-2xl border-none text-white"
          style={{ backgroundColor: "var(--brand-color)" }}
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Submitting..." : "Submit feedback"}
        </button>
      </div>

      {status === "success" ? (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      ) : null}
      {status === "error" ? <div className="alert alert-error text-sm">{message}</div> : null}
    </form>
  );
}
