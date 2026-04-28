"use client";

import { CalendarDays, Clock3, MessageSquareText, Sparkles, X } from "lucide-react";
import type { Idea, IdeaStatus } from "@/types/idea";
import { VoteButton } from "./VoteButton";

type IdeaDetailsModalProps = {
  idea: Idea | null;
  open: boolean;
  loading?: boolean;
  error?: string | null;
  isLoggedIn: boolean;
  isVoting?: boolean;
  onClose: () => void;
  onVoteToggle: (ideaId: string) => void;
};

const statusLabels: Record<IdeaStatus, string> = {
  under_review: "Under Review",
  planned: "Planned",
  in_progress: "In Progress",
  shipped: "Shipped",
  declined: "Declined",
};

const statusTone: Record<IdeaStatus, string> = {
  under_review: "badge-warning",
  planned: "badge-info",
  in_progress: "badge-accent",
  shipped: "badge-success",
  declined: "badge-error",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const buildMockDiscussion = (idea: Idea) => [
  {
    id: `${idea.id}-pm`,
    author: "Product Team",
    role: "Internal note",
    body: `We've added this request to the working queue for ${statusLabels[idea.status].toLowerCase()} tracking. The current mock details view is designed to show how richer context, updates, and discussion could live beside the request.`,
  },
  {
    id: `${idea.id}-author`,
    author: idea.authorName,
    role: "Original request",
    body: idea.description ?? idea.excerpt,
  },
  {
    id: `${idea.id}-next`,
    author: "Roadmap Ops",
    role: "Next step",
    body: `This idea has ${idea.voteCount} votes and ${idea.commentCount} comments so far. When backend support is ready, this section can be swapped to live comments and activity without changing the overall layout.`,
  },
];

export function IdeaDetailsModal({
  idea,
  open,
  loading = false,
  error = null,
  isLoggedIn,
  isVoting = false,
  onClose,
  onVoteToggle,
}: IdeaDetailsModalProps) {
  if (!open) {
    return null;
  }

  const discussion = idea ? buildMockDiscussion(idea) : [];

  return (
    <dialog className="modal modal-open" open>
      <div className="modal-box max-w-4xl border border-base-300 bg-base-100 p-0 shadow-2xl">
        <div className="border-b border-base-300/70 bg-gradient-to-br from-base-100 via-base-100 to-primary/5 px-6 py-6 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge badge-outline gap-1.5 px-3 py-3 text-xs uppercase tracking-[0.2em]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Idea details
                </span>
                {idea ? (
                  <span className={`badge ${statusTone[idea.status]} badge-lg border-0`}>
                    {statusLabels[idea.status]}
                  </span>
                ) : null}
              </div>

              <div>
                <h2 className="text-2xl font-bold text-base-content sm:text-3xl">
                  {idea?.title ?? "Loading idea details"}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-base-content/65 sm:text-base">
                  {idea?.description ?? idea?.excerpt ?? "Pulling together the latest mock context for this request."}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-circle"
              onClick={onClose}
              aria-label="Close idea details"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {idea ? (
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-base-content/60">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                Created {formatDate(idea.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4" />
                Updated {formatDate(idea.updatedAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MessageSquareText className="h-4 w-4" />
                {idea.commentCount} comments
              </span>
            </div>
          ) : null}
        </div>

        <div className="grid gap-6 px-6 py-6 sm:px-8 lg:grid-cols-[1fr_280px]">
          <div className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                <div className="h-5 w-40 rounded bg-base-300 animate-pulse" />
                <div className="h-24 rounded-2xl bg-base-300 animate-pulse" />
                <div className="h-5 w-32 rounded bg-base-300 animate-pulse" />
                <div className="h-28 rounded-2xl bg-base-300 animate-pulse" />
              </div>
            ) : error ? (
              <div role="alert" className="alert alert-error">
                <span>{error}</span>
              </div>
            ) : idea ? (
              <>
                <section className="rounded-2xl border border-base-300/70 bg-base-100 p-5 shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-base-content/55">
                    Overview
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-base-content/75 sm:text-base">
                    {idea.description ?? idea.excerpt}
                  </p>
                </section>

                <section className="rounded-2xl border border-base-300/70 bg-base-100 p-5 shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-base-content/55">
                    Mock discussion
                  </h3>
                  <div className="mt-4 space-y-4">
                    {discussion.map((entry) => (
                      <article key={entry.id} className="rounded-2xl bg-base-200/65 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-base-content">{entry.author}</span>
                          <span className="badge badge-outline badge-sm">{entry.role}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-base-content/70">
                          {entry.body}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>
              </>
            ) : (
              <div role="alert" className="alert alert-warning">
                <span>This idea could not be found in the current mock dataset.</span>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-base-300/70 bg-base-100 p-5 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-base-content/55">
                Signals
              </h3>
              <div className="mt-4 flex items-center gap-4">
                {idea ? (
                  <VoteButton
                    ideaId={idea.id}
                    voteCount={idea.voteCount}
                    hasVoted={idea.hasVoted}
                    onToggle={onVoteToggle}
                    isLoggedIn={isLoggedIn}
                    loading={isVoting}
                  />
                ) : (
                  <div className="h-16 w-14 rounded-xl bg-base-300 animate-pulse" />
                )}
                <div className="space-y-1 text-sm text-base-content/70">
                  <p>
                    <span className="font-semibold text-base-content">
                      {idea?.voteCount ?? "--"}
                    </span>{" "}
                    votes
                  </p>
                  <p>
                    <span className="font-semibold text-base-content">
                      {idea?.commentCount ?? "--"}
                    </span>{" "}
                    comments
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-base-300/70 bg-base-100 p-5 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-base-content/55">
                Categories
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {idea?.categories.length ? (
                  idea.categories.map((category) => (
                    <span key={category.id} className="badge badge-lg badge-outline">
                      {category.label}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-base-content/55">No categories assigned.</span>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-base-300/70 bg-base-100 p-5 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-base-content/55">
                Submitted by
              </h3>
              <p className="mt-3 text-base font-semibold text-base-content">
                {idea?.authorName ?? "Unknown"}
              </p>
              <p className="mt-1 text-sm leading-6 text-base-content/65">
                Mock author metadata for the current detail view. This can later be replaced with live profile, team, and activity information.
              </p>
            </section>
          </aside>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
