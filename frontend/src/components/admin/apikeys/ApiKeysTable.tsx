"use client";

import type { ApiKey } from "@/types/admin";

export function ApiKeysTable({
  keys,
  onRevoke,
}: {
  keys: ApiKey[];
  onRevoke: (keyId: string) => Promise<void>;
}) {
  return (
    <div className="rounded-3xl border border-base-300 bg-base-100 shadow-sm">
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Prefix</th>
              <th>Created</th>
              <th>Last used</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr key={key.id}>
                <td className="font-medium text-base-content">{key.name}</td>
                <td className="font-mono text-sm">{key.prefix}****</td>
                <td className="text-sm text-base-content/60">
                  {new Date(key.createdAt).toLocaleDateString()}
                </td>
                <td className="text-sm text-base-content/60">
                  {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : "Never"}
                </td>
                <td className="text-right">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm text-error"
                    onClick={() => onRevoke(key.id)}
                    disabled={Boolean(key.revokedAt)}
                  >
                    {key.revokedAt ? "Revoked" : "Revoke"}
                  </button>
                </td>
              </tr>
            ))}

            {keys.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-base-content/50">
                  No API keys yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
