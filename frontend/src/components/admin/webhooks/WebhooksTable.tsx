"use client";

import type { Webhook } from "@/types/admin";

export function WebhooksTable({
  webhooks,
  onDelete,
}: {
  webhooks: Webhook[];
  onDelete: (webhookId: string) => Promise<void>;
}) {
  return (
    <div className="rounded-3xl border border-base-300 bg-base-100 shadow-sm">
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Endpoint</th>
              <th>Event</th>
              <th>Status</th>
              <th>Secret</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {webhooks.map((webhook) => (
              <tr key={webhook.id}>
                <td>
                  <div>
                    <p className="font-medium text-base-content">{webhook.url}</p>
                    <p className="text-xs text-base-content/50">
                      Added {new Date(webhook.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </td>
                <td>
                  <span className="badge badge-ghost">{webhook.event}</span>
                </td>
                <td>
                  <span className={`badge ${webhook.status === "active" ? "badge-success" : "badge-warning"}`}>
                    {webhook.status}
                  </span>
                </td>
                <td className="font-mono text-xs">{webhook.secretPreview}</td>
                <td className="text-right">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm text-error"
                    onClick={() => onDelete(webhook.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {webhooks.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-base-content/50">
                  No webhooks configured yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
