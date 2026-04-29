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

const statusDotColor: Record<IdeaStatus, string> = {
  under_review: "bg-warning",
  planned: "bg-info",
  in_progress: "bg-accent",
  shipped: "bg-success",
  declined: "bg-error",
};

const statusLabels: Record<IdeaStatus, string> = {
  under_review: "Under Review",
  planned: "Planned",
  in_progress: "In Progress",
  shipped: "Shipped",
  declined: "Declined",
};

const statusBorderColor: Record<IdeaStatus, string> = {
  under_review: "border-l-warning",
  planned: "border-l-info",
  in_progress: "border-l-accent",
  shipped: "border-l-success",
  declined: "border-l-error",
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

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
      className={`card card-border border-l-4 bg-base-100 shadow-xs transition-all duration-200 hover:-translate-y-px hover:shadow-md ${statusBorderColor[idea.status]}`}
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
        className="card-body flex-row gap-4 cursor-pointer p-4 sm:p-5"
      >
        <div className="shrink-0 pt-0.5">
          <VoteButton
            ideaId={idea.id}
            voteCount={idea.voteCount}
            hasVoted={idea.hasVoted}
            onToggle={onVoteToggle}
            isLoggedIn={isLoggedIn}
            loading={isVoting}
          />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 text-base font-semibold leading-snug text-base-content">
              {idea.title}
            </h3>
          </div>

          <p className="line-clamp-1 text-sm leading-relaxed text-base-content/60">
            {idea.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1">
            <span className="inline-flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${statusDotColor[idea.status]}`} />
              <span className="text-xs font-medium text-base-content/50">
                {statusLabels[idea.status]}
              </span>
            </span>

            <span className="text-base-content/20">·</span>

            {idea.categories.map((category) => (
              <span
                key={category.id}
                className="badge badge-sm badge-ghost font-medium"
              >
                {category.label}
              </span>
            ))}

            <span className="flex-1" />

            <span className="inline-flex items-center gap-1.5 text-xs text-base-content/50">
              <span className="avatar avatar-ring-primary placeholder h-5 w-5">
                <span className="flex h-full w-full items-center justify-center rounded-full bg-neutral text-[9px] font-semibold text-neutral-content">
                  {getInitials(idea.authorName)}
                </span>
              </span>
              {idea.authorName}
            </span>

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
