import { AlertCircle, Lightbulb } from "lucide-react";
import { Button, EmptyState } from "@/components/ui";
import type { Idea } from "@/types/idea";
import { IdeaCard } from "./IdeaCard";

type IdeaListProps = {
  ideas: Idea[];
  loading: boolean;
  error: string | null;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onVoteToggle: (ideaId: string) => void;
  onRetry: () => void;
  onOpenSubmit: () => void;
  isLoggedIn: boolean;
  votingIds: string[];
  onOpenDetails: (ideaId: string) => void;
};

function SkeletonCard() {
  return (
    <div className="card card-border border-l-4 border-l-base-300 bg-base-100 animate-pulse">
      <div className="card-body flex-row gap-4 p-4 sm:p-5">
        <div className="shrink-0">
          <div className="h-16 w-12 rounded-xl bg-base-300" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="h-5 w-3/5 rounded bg-base-300" />
          <div className="h-4 w-full rounded bg-base-300" />
          <div className="flex gap-2 pt-1">
            <div className="h-4 w-20 rounded-full bg-base-300" />
            <div className="h-4 w-16 rounded-full bg-base-300" />
            <div className="h-4 w-24 rounded-full bg-base-300" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function IdeaList({
  ideas,
  loading,
  error,
  hasNextPage,
  onLoadMore,
  onVoteToggle,
  onRetry,
  onOpenSubmit,
  isLoggedIn,
  votingIds,
  onOpenDetails,
}: IdeaListProps) {
  if (loading && ideas.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (error && ideas.length === 0) {
    return (
      <EmptyState
        icon={<AlertCircle className="h-7 w-7" />}
        title="We couldn't load ideas right now"
        description={error}
        action={
          <Button onClick={onRetry} variant="outline">
            Try again
          </Button>
        }
      />
    );
  }

  if (!loading && ideas.length === 0) {
    return (
      <EmptyState
        icon={<Lightbulb className="h-7 w-7" />}
        title="No ideas match these filters"
        description="Try adjusting your search or filters, or share a new request with the team."
        action={<Button onClick={onOpenSubmit}>Submit an idea</Button>}
      />
    );
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div role="alert" className="alert alert-error alert-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      ) : null}

      {ideas.map((idea, index) => (
        <IdeaCard
          key={idea.id}
          idea={idea}
          onVoteToggle={onVoteToggle}
          isVoting={votingIds.includes(idea.id)}
          isLoggedIn={isLoggedIn}
          onOpenDetails={onOpenDetails}
          style={{ animationDelay: `${index * 50}ms` }}
        />
      ))}

      {hasNextPage ? (
        <div className="flex justify-center pt-4">
          <Button variant="ghost" onClick={onLoadMore} disabled={loading}>
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                Loading...
              </>
            ) : (
              "Load more ideas"
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
