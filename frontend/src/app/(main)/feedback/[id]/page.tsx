"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchIdeaById, fetchIdeaComments, toggleVote } from "@/lib/feedbackApi";
import { hasStoredSession } from "@/lib/authStorage";
import type { Idea, Comment } from "@/types/idea";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CommentThread } from "@/components/comments/CommentThread";
import { ArrowLeft, ChevronUp } from "lucide-react";

export default function IdeaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ideaId = params.id as string;
  
  const [idea, setIdea] = useState<Idea | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(hasStoredSession());
    
    let active = true;
    
    const loadData = async () => {
      try {
        setLoading(true);
        const [ideaData, commentsData] = await Promise.all([
          fetchIdeaById(ideaId),
          fetchIdeaComments(ideaId),
        ]);
        
        if (!active) return;
        
        if (!ideaData) {
          setError("Idea not found");
        } else {
          setIdea(ideaData);
          setComments(commentsData);
        }
      } catch (err) {
        if (!active) return;
        setError("Failed to load idea details");
      } finally {
        if (active) setLoading(false);
      }
    };
    
    loadData();
    
    return () => {
      active = false;
    };
  }, [ideaId]);

  const handleVote = async () => {
    if (!idea) return;
    if (!isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent(`/feedback/${ideaId}`)}`);
      return;
    }
    
    setIsVoting(true);
    const prevVoted = idea.hasVoted;
    const prevCount = idea.voteCount;
    
    setIdea({
      ...idea,
      hasVoted: !prevVoted,
      voteCount: prevCount + (prevVoted ? -1 : 1),
    });
    
    try {
      const result = await toggleVote(idea.id, prevVoted);
      setIdea((current) => current ? {
        ...current,
        hasVoted: result.hasVoted,
        voteCount: result.voteCount,
      } : current);
    } catch (err) {
      setIdea((current) => current ? {
        ...current,
        hasVoted: prevVoted,
        voteCount: prevCount,
      } : current);
      // Could show toast error here
    } finally {
      setIsVoting(false);
    }
  };

  const handleCommentAdded = (newComment: Comment) => {
    setComments((prev) => [...prev, newComment]);
    setIdea((prev) => prev ? { ...prev, commentCount: prev.commentCount + 1 } : prev);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-error">{error}</h2>
        <button className="btn btn-ghost mt-4" onClick={() => router.push("/")}>
          Go back home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <button 
        onClick={() => router.back()} 
        className="btn btn-ghost btn-sm mb-6 -ml-3 text-base-content/60"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </button>

      <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-6 md:p-8 mb-8">
        <div className="flex gap-6 items-start">
          <div className="flex flex-col items-center">
            <button
              onClick={handleVote}
              disabled={isVoting}
              className={`flex flex-col items-center justify-center w-12 h-16 rounded-xl border-2 transition-all ${
                idea.hasVoted
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-base-200 bg-base-50 text-base-content/60 hover:border-primary/30 hover:bg-base-200"
              }`}
            >
              <ChevronUp className="h-6 w-6 -mb-1" strokeWidth={idea.hasVoted ? 3 : 2} />
              <span className="font-bold text-sm">{idea.voteCount}</span>
            </button>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <StatusBadge status={idea.status} />
                <span className="text-sm text-base-content/50">
                  Posted by <span className="font-medium text-base-content/80">{idea.authorName}</span>
                </span>
                <span className="text-sm text-base-content/50">&bull;</span>
                <span className="text-sm text-base-content/50">
                  {new Date(idea.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-base-content">{idea.title}</h1>
            </div>

            <div className="prose prose-sm sm:prose-base max-w-none text-base-content/80">
              {idea.description ? (
                <p className="whitespace-pre-wrap">{idea.description}</p>
              ) : (
                <p className="whitespace-pre-wrap">{idea.excerpt}</p>
              )}
            </div>

            {idea.categories && idea.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {idea.categories.map((cat) => (
                  <span key={cat.id} className="badge badge-outline text-xs">
                    {cat.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 p-6 md:p-8">
        <CommentThread
          ideaId={idea.id}
          comments={comments}
          onCommentAdded={handleCommentAdded}
          isLoggedIn={isLoggedIn}
        />
      </div>
    </div>
  );
}
