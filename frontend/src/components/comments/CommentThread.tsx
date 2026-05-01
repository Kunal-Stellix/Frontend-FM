"use client";

import { useState } from "react";
import type { Comment } from "@/types/idea";
import { CommentComposer } from "./CommentComposer";

type CommentThreadProps = {
  ideaId: string;
  comments: Comment[];
  onCommentAdded: (newComment: Comment) => void;
  isLoggedIn: boolean;
};

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function CommentItem({
  comment,
  ideaId,
  onCommentAdded,
  isLoggedIn,
  isReply = false,
}: {
  comment: Comment;
  ideaId: string;
  onCommentAdded: (newComment: Comment) => void;
  isLoggedIn: boolean;
  isReply?: boolean;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);

  return (
    <div className={`flex gap-4 ${isReply ? "ml-12 mt-4" : "mt-6"}`}>
      <div className="avatar placeholder self-start">
        <div className="bg-neutral text-neutral-content w-10 rounded-full">
          <span>{comment.authorName.slice(0, 2).toUpperCase()}</span>
        </div>
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-base-content">{comment.authorName}</span>
          <span className="text-xs text-base-content/50">{formatTimeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-base-content/80 whitespace-pre-wrap">{comment.content}</p>

        {!isReply && (
          <button
            type="button"
            className="text-xs font-semibold text-base-content/50 hover:text-primary transition-colors"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            Reply
          </button>
        )}

        {showReplyForm && (
          <div className="mt-3">
            <CommentComposer
              ideaId={ideaId}
              parentId={comment.id}
              isLoggedIn={isLoggedIn}
              onCommentAdded={(newComment) => {
                setShowReplyForm(false);
                onCommentAdded(newComment);
              }}
              placeholder="Write a reply..."
            />
          </div>
        )}

        {/* Render nested replies if any */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-4">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                ideaId={ideaId}
                onCommentAdded={onCommentAdded}
                isLoggedIn={isLoggedIn}
                isReply
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CommentThread({
  ideaId,
  comments,
  onCommentAdded,
  isLoggedIn,
}: CommentThreadProps) {
  // Sort main comments chronologically
  const sortedComments = [...comments]
    .filter((c) => !c.parentId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Attach replies to parents
  const replies = comments.filter((c) => c.parentId);

  const mergeReplies = (nestedReplies: Comment[] = [], flatReplies: Comment[] = []) => {
    const replyMap = new Map<string, Comment>();

    [...nestedReplies, ...flatReplies].forEach((reply) => {
      if (!replyMap.has(reply.id)) {
        replyMap.set(reply.id, reply);
      }
    });

    return [...replyMap.values()].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  };

  const thread = sortedComments.map((parent) => {
    const parentReplies = mergeReplies(
      parent.replies,
      replies.filter((reply) => reply.parentId === parent.id),
    );
    return { ...parent, replies: parentReplies };
  });

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-bold text-base-content mb-4">Comments</h3>
        <CommentComposer
          ideaId={ideaId}
          isLoggedIn={isLoggedIn}
          onCommentAdded={onCommentAdded}
        />
      </div>

      <div className="divide-y divide-base-200/50">
        {thread.map((comment, index) => (
          <div key={comment.id} className={index > 0 ? "pt-6" : ""}>
            <CommentItem
              comment={comment}
              ideaId={ideaId}
              onCommentAdded={onCommentAdded}
              isLoggedIn={isLoggedIn}
            />
          </div>
        ))}
      </div>

      {thread.length === 0 && (
        <p className="text-sm text-base-content/50 text-center py-8">
          No comments yet. Be the first to share your thoughts!
        </p>
      )}
    </div>
  );
}
