"use client";

import { MessageSquareText } from "lucide-react";
import type { Idea, IdeaStatus } from "@/types/idea";
import { VoteButton } from "./VoteButton";

type IdeaCardProps = {
  idea: Idea;
  onVoteToggle: (ideaId: string) => void;
  isVoting?: boolean;
  isLoggedIn: boolean;
  onOpenDetails: (ideaId: string) => void;
  style?: React.CSSProperties;
};

/* ── Status config ── */

const statusDotColor: Record<IdeaStatus, string> = {
  under_review: "bg-warning",
  planned:      "bg-info",
  in_progress:  "bg-accent",
  shipped:      "bg-success",
  declined:     "bg-error",
};

const statusLabels: Record<IdeaStatus, string> = {
  under_review: "Under Review",
  planned:      "Planned",
  in_progress:  "In Progress",
  shipped:      "Shipped",
  declined:     "Declined",
};

const statusBorderColor: Record<IdeaStatus, string> = {
  under_review: "border-l-warning",
  planned:      "border-l-info",
  in_progress:  "border-l-accent",
  shipped:      "border-l-success",
  declined:     "border-l-error",
};

/* ── Initials helper ── */

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/* ── Component ── */

export function IdeaCard({
  idea,
  onVoteToggle,
  isVoting = false,
  isLoggedIn,
  onOpenDetails,
  style,
}: IdeaCardProps) {
  return (
    <article
      style={style}
      className={`card card-border bg-base-100 border-l-4 ${statusBorderColor[idea.status]} shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-px`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpenDetails(idea.id)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpenDetails(idea.id);
          }
        }}
        className="card-body p-4 sm:p-5 flex-row gap-4 cursor-pointer"
      >
        {/* Vote button — left column */}
        <div className="flex-shrink-0 pt-0.5">
          <VoteButton
            ideaId={idea.id}
            voteCount={idea.voteCount}
            hasVoted={idea.hasVoted}
            onToggle={onVoteToggle}
            isLoggedIn={isLoggedIn}
            loading={isVoting}
          />
        </div>

        {/* Content — right column */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title row */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold text-base-content leading-snug line-clamp-2">
              {idea.title}
            </h3>
          </div>

          {/* Excerpt */}
          <p className="text-sm text-base-content/60 leading-relaxed line-clamp-1">
            {idea.excerpt}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1">
            {/* Status dot + label */}
            <span className="inline-flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${statusDotColor[idea.status]}`} />
              <span className="text-xs font-medium text-base-content/50">
                {statusLabels[idea.status]}
              </span>
            </span>

            {/* Divider */}
            <span className="text-base-content/20">·</span>

            {/* Categories */}
            {idea.categories.map((category) => (
              <span
                key={category.id}
                className="badge badge-sm badge-ghost font-medium"
              >
                {category.label}
              </span>
            ))}

            {/* Spacer */}
            <span className="flex-1" />

            {/* Author */}
            <span className="inline-flex items-center gap-1.5 text-xs text-base-content/50">
              <span className="avatar avatar-ring-primary placeholder w-5 h-5">
                <span className="bg-neutral text-neutral-content rounded-full text-[9px] font-semibold w-full h-full flex items-center justify-center">
                  {getInitials(idea.authorName)}
                </span>
              </span>
              {idea.authorName}
            </span>

            {/* Comments */}
            <span className="inline-flex items-center gap-1 text-xs text-base-content/50">
              <MessageSquareText className="h-3.5 w-3.5" />
              {idea.commentCount}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
