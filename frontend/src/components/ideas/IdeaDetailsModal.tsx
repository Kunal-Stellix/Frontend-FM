"use client";

import { MessageSquare, Paperclip, X } from "lucide-react";
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

const getAvatarUrl = (name: string) => 
  `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=e2e8f0&textColor=475569`;

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

  return (
    <dialog className={`modal ${open ? "modal-open" : ""}`} open={open}>
      <div className="modal-box absolute right-0 top-0 m-0 h-full max-h-screen w-full max-w-[700px] rounded-none !scale-100 !translate-y-0 p-8 shadow-2xl overflow-y-auto bg-base-100">
        <button
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-6 top-6 text-base-content/40 hover:text-base-content"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>

        {loading ? (
          <div className="space-y-6 mt-6">
            <div className="h-8 w-3/4 rounded bg-base-300 animate-pulse" />
            <div className="h-24 w-full rounded bg-base-300 animate-pulse" />
          </div>
        ) : error ? (
          <div role="alert" className="alert alert-error mt-6">
            <span>{error}</span>
          </div>
        ) : idea ? (
          <div className="mt-8">
            <div className="flex gap-5">
              <div className="shrink-0 pt-1">
                <VoteButton
                  ideaId={idea.id}
                  voteCount={idea.voteCount}
                  hasVoted={idea.hasVoted}
                  onToggle={onVoteToggle}
                  isLoggedIn={isLoggedIn}
                  loading={isVoting}
                  className="min-w-16 h-20 rounded-xl border-2 bg-base-100"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-base-content leading-tight">
                  {idea.title}
                </h2>
                <div className="mt-4 text-[15px] leading-relaxed text-base-content/80 whitespace-pre-wrap">
                  {idea.description ?? idea.excerpt}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-semibold text-base-content/70">
                  <span>#{idea.id.slice(0, 4)}</span>
                  <span>{idea.authorName}</span>
                  <div className="h-6 w-6 overflow-hidden rounded-full bg-base-300 border border-base-300">
                    <img src={getAvatarUrl(idea.authorName)} alt={idea.authorName} className="h-full w-full object-cover" />
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {idea.categories.map((category) => (
                    <span key={category.id} className="text-sm font-medium text-base-content/60">
                      #{category.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-12 rounded-xl border border-base-200 bg-base-100 p-4 shadow-sm relative">
              <textarea
                className="w-full min-h-[100px] resize-none border-0 bg-transparent p-1 text-sm focus:outline-none placeholder:text-base-content/40"
                placeholder="Add a comment..."
              />
              <div className="mt-2 flex items-center justify-between">
                <button type="button" className="btn btn-ghost btn-sm btn-circle text-base-content/40 hover:text-base-content">
                  <Paperclip className="h-4 w-4" />
                </button>
                <button type="button" className="btn btn-primary btn-sm px-5 font-bold">
                  Add comment
                </button>
              </div>
            </div>

            <div className="mt-12">
              <h3 className="border-b border-base-200 pb-3 text-sm font-semibold text-base-content/70">
                Activity
              </h3>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <MessageSquare className="h-8 w-8 text-base-content/20 mb-3" />
                <p className="text-sm text-base-content/50">
                  Be the first to comment on this Idea
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div role="alert" className="alert alert-warning mt-6">
            <span>This idea could not be found.</span>
          </div>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>
          close
        </button>
      </form>
    </dialog>
  );
}
