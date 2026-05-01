"use client";

import { FolderKanban } from "lucide-react";
import type { RoadmapItem } from "@/types/idea";

export function WidgetRoadmapTab({ items }: { items: RoadmapItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-[22px] border border-dashed border-base-300 bg-base-100 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-base-200 text-base-content/60">
          <FolderKanban className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-base-content">Roadmap preview is empty</h2>
        <p className="mt-2 text-sm leading-6 text-base-content/60">
          Planned work will appear here once product milestones are published to the portal.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.slice(0, 6).map((item) => (
        <article key={item.id} className="rounded-[20px] border border-base-300 bg-base-100 p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold leading-6 text-base-content">{item.title}</h3>
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold capitalize text-white"
              style={{ backgroundColor: "var(--brand-color)" }}
            >
              {item.status.replace("_", " ")}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-base-content/65">{item.excerpt}</p>
        </article>
      ))}
    </div>
  );
}
