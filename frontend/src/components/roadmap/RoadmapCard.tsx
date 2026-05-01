"use client";

import type { RoadmapItem } from "@/types/idea";
import { ChevronUp, MessageSquare } from "lucide-react";

type RoadmapCardProps = {
  item: RoadmapItem;
  onClick: (item: RoadmapItem) => void;
};

export function RoadmapCard({ item, onClick }: RoadmapCardProps) {
  return (
    <div
      onClick={() => onClick(item)}
      className="bg-base-100 rounded-xl p-4 shadow-sm border border-base-200 cursor-pointer hover:border-primary/50 transition-colors flex flex-col gap-3 group"
    >
      <div>
        <h4 className="font-semibold text-sm text-base-content group-hover:text-primary transition-colors line-clamp-2">
          {item.title}
        </h4>
        <p className="text-xs text-base-content/60 mt-1 line-clamp-2">
          {item.excerpt}
        </p>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div className={`badge badge-sm gap-1 font-medium ${item.hasVoted ? "badge-primary" : "badge-ghost bg-base-200"}`}>
          <ChevronUp className="h-4 w-4" strokeWidth={item.hasVoted ? 3 : 2} />
          {item.voteCount}
        </div>

        {item.commentCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-base-content/50 font-medium">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{item.commentCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}
