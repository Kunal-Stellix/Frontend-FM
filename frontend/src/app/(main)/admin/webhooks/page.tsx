"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import { createWebhook, deleteWebhook, fetchWebhooks } from "@/lib/feedbackApi";
import type { Webhook, WebhookEvent } from "@/types/admin";
import { WebhooksTable } from "@/components/admin/webhooks/WebhooksTable";

export default function AdminWebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [url, setUrl] = useState("");
  const [event, setEvent] = useState<WebhookEvent>("idea.status_changed");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        const response = await fetchWebhooks();
        if (active) setWebhooks(response);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load webhooks.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const handleCreate = async (eventForm: React.FormEvent<HTMLFormElement>) => {
    eventForm.preventDefault();

    try {
      setSubmitting(true);
      setError(null);
      const response = await createWebhook({ url, event });
      setWebhooks((current) => [response, ...current]);
      setUrl("");
      setEvent("idea.status_changed");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to add webhook.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (webhookId: string) => {
    if (!window.confirm("Delete this webhook?")) return;
    const previous = webhooks;
    setWebhooks((current) => current.filter((webhook) => webhook.id !== webhookId));

    try {
      await deleteWebhook(webhookId);
    } catch (deleteError) {
      setWebhooks(previous);
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete webhook.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link href="/admin" className="btn btn-ghost btn-sm -ml-3 mb-4 text-base-content/60">
          <ChevronLeft className="h-4 w-4" />
          Back to Admin
        </Link>
        <h1 className="text-3xl font-bold text-base-content">Webhooks</h1>
        <p className="mt-2 text-base-content/60">
          Configure outbound updates with placeholder data while backend registration endpoints are
          still in progress.
        </p>
      </div>

      <div className="space-y-6">
        <form onSubmit={handleCreate} className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-base-200 p-3 text-primary">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-base-content">Add webhook</h2>
              <p className="text-sm text-base-content/60">
                Create a new outbound endpoint for idea or changelog events.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_auto]">
            <input
              type="url"
              value={url}
              onChange={(inputEvent) => setUrl(inputEvent.target.value)}
              className="input input-bordered"
              placeholder="https://example.com/hooks/feedback"
              required
            />
            <select
              className="select select-bordered"
              value={event}
              onChange={(selectEvent) => setEvent(selectEvent.target.value as WebhookEvent)}
            >
              <option value="idea.created">idea.created</option>
              <option value="idea.status_changed">idea.status_changed</option>
              <option value="changelog.published">changelog.published</option>
            </select>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Adding..." : "Add webhook"}
            </button>
          </div>
        </form>

        {error ? <div className="alert alert-error">{error}</div> : null}

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : (
          <WebhooksTable webhooks={webhooks} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}
