"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { submitComment } from "@/lib/feedbackApi";
import type { Comment } from "@/types/idea";

type CommentComposerProps = {
  ideaId: string;
  parentId?: string | null;
  onCommentAdded: (newComment: Comment) => void;
  isLoggedIn: boolean;
  placeholder?: string;
};

export function CommentComposer({
  ideaId,
  parentId = null,
  onCommentAdded,
  isLoggedIn,
  placeholder = "Leave a comment...",
}: CommentComposerProps) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (!isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const newComment = await submitComment(ideaId, { content, parentId });
      setContent("");
      onCommentAdded(newComment);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea
        className={`textarea textarea-bordered w-full resize-none bg-base-100 ${error ? "textarea-error" : ""}`}
        rows={3}
        placeholder={placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={submitting}
      />
      
      {error && <span className="text-sm text-error">{error}</span>}
      
      <div className="flex items-center justify-between">
        {!isLoggedIn ? (
          <span className="text-xs text-base-content/60">
            You must be signed in to comment.
          </span>
        ) : (
          <span />
        )}
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={!content.trim() || submitting}
        >
          {submitting ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            "Post Comment"
          )}
        </button>
      </div>
    </form>
  );
}
