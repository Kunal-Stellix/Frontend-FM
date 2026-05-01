"use client";

import { SearchX } from "lucide-react";
import type { Idea } from "@/types/idea";

export function WidgetBrowseTab({ ideas }: { ideas: Idea[] }) {
  if (ideas.length === 0) {
    return (
      <div className="rounded-[22px] border border-dashed border-base-300 bg-base-100 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-base-200 text-base-content/60">
          <SearchX className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-base-content">No feedback ideas yet</h2>
        <p className="mt-2 text-sm leading-6 text-base-content/60">
          Once the first requests land, this widget will turn into a compact discovery feed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {ideas.slice(0, 5).map((idea) => (
        <article key={idea.id} className="rounded-[20px] border border-base-300 bg-base-100 p-4">
          <div className="mb-2 flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold leading-6 text-base-content">{idea.title}</h3>
            <span className="rounded-full bg-base-200 px-3 py-1 text-xs font-medium whitespace-nowrap text-base-content/70">
              {idea.voteCount} votes
            </span>
          </div>
          <p className="text-sm leading-6 text-base-content/65">{idea.excerpt}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="flex flex-wrap gap-2">
              {idea.categories.map((category) => (
              <span key={category.id} className="rounded-full border border-base-300 px-2.5 py-1 text-xs font-medium text-base-content/60">
                {category.label}
              </span>
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
