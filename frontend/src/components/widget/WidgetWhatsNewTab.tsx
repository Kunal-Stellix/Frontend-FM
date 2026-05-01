"use client";

import { Newspaper } from "lucide-react";
import type { Changelog } from "@/types/admin";

export function WidgetWhatsNewTab({ entries }: { entries: Changelog[] }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-[22px] border border-dashed border-base-300 bg-base-100 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-base-200 text-base-content/60">
          <Newspaper className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-base-content">No changelog updates yet</h2>
        <p className="mt-2 text-sm leading-6 text-base-content/60">
          Product announcements and release notes will show up here when they are published.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.slice(0, 4).map((entry) => (
        <article key={entry.id} className="rounded-[20px] border border-base-300 bg-base-100 p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="rounded-full border border-base-300 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-base-content/55">
              {entry.type.replace("_", " ")}
            </span>
            <span className="text-xs text-base-content/50">
              {new Date(entry.date).toLocaleDateString()}
            </span>
          </div>
          <h3 className="text-base font-semibold leading-6 text-base-content">{entry.title}</h3>
          <p className="mt-2 text-sm leading-6 text-base-content/65 line-clamp-3">
            {entry.body.replace(/<[^>]*>/g, "")}
          </p>
        </article>
      ))}
    </div>
  );
}
