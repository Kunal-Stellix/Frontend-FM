"use client";

import { ChevronUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type VoteButtonProps = {
  ideaId: string;
  voteCount: number;
  hasVoted: boolean;
  onToggle: (ideaId: string) => void;
  isLoggedIn: boolean;
  loading?: boolean;
};

export function VoteButton({
  ideaId,
  voteCount,
  hasVoted,
  onToggle,
  isLoggedIn,
  loading = false,
}: VoteButtonProps) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onToggle(ideaId);
      }}
      disabled={loading}
      aria-pressed={hasVoted}
      aria-label={isLoggedIn ? "Toggle vote" : "Sign in to vote"}
      className={cn(
        "btn btn-sm flex-col gap-0.5 min-w-12 h-auto py-2 px-3 rounded-xl border transition-all duration-200",
        hasVoted
          ? "btn-primary shadow-sm"
          : "btn-ghost border-base-300 hover:border-primary/50 hover:bg-primary/5",
        loading && "opacity-60 pointer-events-none",
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ChevronUp
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            hasVoted && "scale-110",
          )}
          strokeWidth={hasVoted ? 3 : 2}
        />
      )}
      <span className="text-xs font-bold tabular-nums leading-none">
        {voteCount}
      </span>
    </button>
  );
}
