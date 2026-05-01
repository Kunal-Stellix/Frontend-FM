"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Copy } from "lucide-react";
import { fetchApiKeys, generateApiKey, revokeApiKey } from "@/lib/feedbackApi";
import type { ApiKey } from "@/types/admin";
import { ApiKeysTable } from "@/components/admin/apikeys/ApiKeysTable";
import { GenerateApiKeyCard } from "@/components/admin/apikeys/GenerateApiKeyCard";

export default function AdminApiKeysPage() {
  const router = useRouter();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [latestToken, setLatestToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        const response = await fetchApiKeys();
        if (active) setKeys(response);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load API keys.");
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

  const handleGenerate = async (name: string) => {
    const response = await generateApiKey(name);
    setKeys((current) => [response.key, ...current]);
    setLatestToken(response.plainTextToken);
  };

  const handleRevoke = async (keyId: string) => {
    if (!window.confirm("Revoke this API key?")) return;
    const previous = keys;
    setKeys((current) =>
      current.map((key) => (key.id === keyId ? { ...key, revokedAt: new Date().toISOString() } : key)),
    );

    try {
      await revokeApiKey(keyId);
    } catch (revokeError) {
      setKeys(previous);
      setError(revokeError instanceof Error ? revokeError.message : "Failed to revoke API key.");
    }
  };

  const handleCopy = async () => {
    if (!latestToken) return;

    try {
      await navigator.clipboard.writeText(latestToken);
      setCopyStatus("success");
      window.setTimeout(() => setCopyStatus("idle"), 2000);
    } catch {
      setCopyStatus("error");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <button
          type="button"
          className="btn btn-ghost btn-sm -ml-3 mb-4 text-base-content/60"
          onClick={() => {
            if (window.history.length > 1) router.back();
            else router.push("/admin");
          }}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Admin
        </button>
        <h1 className="text-3xl font-bold text-base-content">API keys</h1>
        <p className="mt-2 text-base-content/60">
          Generate placeholder REST keys, reveal them once, and revoke access without waiting on
          backend key management endpoints.
        </p>
      </div>

      <div className="space-y-6">
        <GenerateApiKeyCard onGenerate={handleGenerate} />

        {latestToken ? (
          <div className="rounded-3xl border border-success/30 bg-success/10 p-5">
            <div className="mb-2 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-base-content">Copy this key now</h2>
                <p className="text-sm text-base-content/60">
                  This placeholder follows the real one-time reveal pattern.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={handleCopy}
              >
                <Copy className="h-4 w-4" />
                {copyStatus === "success" ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="rounded-2xl bg-base-100 p-4 font-mono text-sm break-all">
              {latestToken}
            </div>
            {copyStatus === "error" ? (
              <p className="mt-3 text-sm text-error">
                Copy failed in this browser session. You can still select the key manually.
              </p>
            ) : null}
          </div>
        ) : null}

        {error ? <div className="alert alert-error">{error}</div> : null}

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : (
          <ApiKeysTable keys={keys} onRevoke={handleRevoke} />
        )}
      </div>
    </div>
  );
}
