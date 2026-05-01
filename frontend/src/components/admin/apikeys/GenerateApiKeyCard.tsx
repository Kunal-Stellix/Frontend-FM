"use client";

import { useState } from "react";

export function GenerateApiKeyCard({
  onGenerate,
}: {
  onGenerate: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState("Generated key");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLoading(true);
      await onGenerate(name.trim() || "Generated key");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleGenerate} className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-base-content">Generate API key</h2>
      <p className="mt-1 text-sm text-base-content/60">
        This uses placeholder token generation for now, but follows the one-time reveal flow.
      </p>

      <div className="mt-5 flex flex-col gap-4 md:flex-row">
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="input input-bordered flex-1"
          placeholder="Integration name"
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Generating..." : "Generate key"}
        </button>
      </div>
    </form>
  );
}
