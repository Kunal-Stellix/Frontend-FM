"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Idea, Comment } from "@/types/idea";
import { VoteButton } from "./VoteButton";
import { CommentThread } from "@/components/comments/CommentThread";
import { fetchIdeaComments } from "@/lib/feedbackApi";

type IdeaDetailsModalProps = {
  idea: Idea | null;
  open: boolean;
  loading?: boolean;
  error?: string | null;
  isLoggedIn: boolean;
  isVoting?: boolean;
  onClose: () => void;
  onVoteToggle: (ideaId: string) => void;
  onCommentAdded?: () => void;
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
  onCommentAdded,
}: IdeaDetailsModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  useEffect(() => {
    if (open && idea) {
      let active = true;
      Promise.resolve().then(() => {
        if (active) {
          setCommentsLoading(true);
        }
      });
      fetchIdeaComments(idea.id)
        .then((data) => {
          if (active) {
            setComments(data);
            setCommentsLoading(false);
          }
        })
        .catch(() => {
          if (active) {
            setCommentsLoading(false);
          }
        });

      return () => {
        active = false;
      };
    }
    Promise.resolve().then(() => {
      setComments([]);
      setCommentsLoading(false);
    });
  }, [open, idea]);

  const handleCommentAdded = (newComment: Comment) => {
    setComments((prev) => [...prev, newComment]);
    onCommentAdded?.();
  };

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
                <div className="stats stats-vertical border border-base-300 bg-base-200/40 shadow-none">
                  <VoteButton
                    ideaId={idea.id}
                    voteCount={idea.voteCount}
                    hasVoted={idea.hasVoted}
                    onToggle={onVoteToggle}
                    isLoggedIn={isLoggedIn}
                    loading={isVoting}
                    className="hover:bg-base-200/80"
                  />
                </div>
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
                    <Image
                      src={getAvatarUrl(idea.authorName)}
                      alt={idea.authorName}
                      width={24}
                      height={24}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
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

            <div className="mt-12 pt-8 border-t border-base-200">
              {commentsLoading ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-md text-primary"></span>
                </div>
              ) : (
                <CommentThread
                  ideaId={idea.id}
                  comments={comments}
                  onCommentAdded={handleCommentAdded}
                  isLoggedIn={isLoggedIn}
                />
              )}
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
