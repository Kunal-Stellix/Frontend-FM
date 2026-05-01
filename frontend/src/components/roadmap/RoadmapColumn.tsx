"use client";

import type { RoadmapItem } from "@/types/idea";
import { RoadmapCard } from "./RoadmapCard";

type RoadmapColumnProps = {
  title: string;
  items: RoadmapItem[];
  colorClass: string;
  onItemClick: (item: RoadmapItem) => void;
};

export function RoadmapColumn({ title, items, colorClass, onItemClick }: RoadmapColumnProps) {
  return (
    <div className="flex flex-col bg-base-200/30 rounded-2xl p-4 h-full min-w-[280px]">
      <div className="flex items-center gap-3 mb-4 pb-2 border-b border-base-200/50">
        <div className={`w-2 h-2 rounded-full ${colorClass}`} />
        <h3 className="font-bold text-base-content uppercase tracking-wider text-sm flex-1">
          {title}
        </h3>
        <span className="badge badge-sm font-bold text-base-content/60">
          {items.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-3 pb-2 custom-scrollbar">
        {items.map((item) => (
          <RoadmapCard key={item.id} item={item} onClick={onItemClick} />
        ))}
        {items.length === 0 && (
          <div className="text-center py-8 text-sm text-base-content/40 border-2 border-dashed border-base-200 rounded-xl">
            No items yet
          </div>
        )}
      </div>
    </div>
  );
}
