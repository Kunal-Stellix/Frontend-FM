"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchAdminIdeas, updateIdeaStatus } from "@/lib/feedbackApi";
import type { AdminIdea } from "@/types/admin";
import type { IdeaStatus } from "@/types/idea";
import { ArrowLeft, Check, X, GitMerge } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { MergeModal } from "@/components/admin/MergeModal";
import { hasStoredSession } from "@/lib/authStorage";

export default function AdminIdeasPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<AdminIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAuthorized = hasStoredSession();
  
  // Merge Modal state
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [selectedPrimaryIdea, setSelectedPrimaryIdea] = useState<AdminIdea | null>(null);

  const loadData = async () => {
    let active = true;
    try {
      const data = await fetchAdminIdeas();
      if (active) setIdeas(data);
    } catch {
      if (active) setError("Failed to load admin ideas.");
    } finally {
      if (active) setLoading(false);
    }
    return () => { active = false; };
  };

  useEffect(() => {
    if (isAuthorized) {
      Promise.resolve().then(loadData);
    }
  }, [isAuthorized]);

  if (!isAuthorized) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-error">Unauthorized access.</h2>
      </div>
    );
  }

  const handleStatusChange = async (ideaId: string, newStatus: IdeaStatus) => {
    try {
      // Optimistic update
      setIdeas(prev => prev.map(idea => 
        idea.id === ideaId ? { ...idea, status: newStatus } : idea
      ));
      await updateIdeaStatus(ideaId, newStatus);
    } catch {
      // Revert on error
      loadData();
      alert("Failed to update status");
    }
  };

  const handleMergeClick = (idea: AdminIdea) => {
    setSelectedPrimaryIdea(idea);
    setIsMergeModalOpen(true);
  };

  if (loading && ideas.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error && ideas.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-error">{error}</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <button 
          onClick={() => {
            if (window.history.length > 1) router.back();
            else router.push("/admin");
          }}
          className="btn btn-ghost btn-sm mb-4 -ml-3 text-base-content/60"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-base-content">Manage Ideas</h1>
        <p className="text-base-content/60 mt-1">Review, approve, reject, or merge user feedback.</p>
      </div>

      <div className="bg-base-100 rounded-xl border border-base-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-base-200/50">
              <tr>
                <th className="w-1/3">Title & Excerpt</th>
                <th>Author & Date</th>
                <th>Status</th>
                <th>Stats</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ideas.map((idea) => (
                <tr key={idea.id} className="hover:bg-base-200/20 group">
                  <td>
                    <div className="flex flex-col gap-1 max-w-sm">
                      <Link 
                        href={`/feedback/${idea.id}`} 
                        className="font-bold text-base-content hover:text-primary transition-colors line-clamp-1"
                      >
                        {idea.title}
                      </Link>
                      <span className="text-xs text-base-content/60 line-clamp-2">
                        {idea.excerpt}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{idea.authorName}</span>
                      <span className="text-xs text-base-content/50">
                        {new Date(idea.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="dropdown dropdown-bottom">
                      <div tabIndex={0} role="button" className="cursor-pointer hover:opacity-80">
                        <StatusBadge status={idea.status} />
                      </div>
                      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-1 border border-base-200">
                        <li><a onClick={() => handleStatusChange(idea.id, "under_review")}>Under Review</a></li>
                        <li><a onClick={() => handleStatusChange(idea.id, "planned")}>Planned</a></li>
                        <li><a onClick={() => handleStatusChange(idea.id, "in_progress")}>In Progress</a></li>
                        <li><a onClick={() => handleStatusChange(idea.id, "shipped")}>Shipped</a></li>
                        <li><a onClick={() => handleStatusChange(idea.id, "declined")} className="text-error">Declined</a></li>
                      </ul>
                    </div>
                  </td>
                  <td>
                    <div className="text-xs font-medium space-y-1">
                      <div><span className="text-base-content/50">Votes:</span> {idea.voteCount}</div>
                      <div><span className="text-base-content/50">Comments:</span> {idea.commentCount}</div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="tooltip tooltip-left" data-tip="Approve (Planned)">
                        <button 
                          className="btn btn-sm btn-circle btn-ghost text-success"
                          onClick={() => handleStatusChange(idea.id, "planned")}
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="tooltip tooltip-top" data-tip="Reject (Declined)">
                        <button 
                          className="btn btn-sm btn-circle btn-ghost text-error"
                          onClick={() => handleStatusChange(idea.id, "declined")}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="tooltip tooltip-top" data-tip="Merge into another idea">
                        <button 
                          className="btn btn-sm btn-circle btn-ghost text-info"
                          onClick={() => handleMergeClick(idea)}
                        >
                          <GitMerge className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              
              {ideas.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-base-content/50">
                    No ideas require moderation at this time.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPrimaryIdea && (
        <MergeModal
          primaryIdea={selectedPrimaryIdea}
          allIdeas={ideas}
          isOpen={isMergeModalOpen}
          onClose={() => setIsMergeModalOpen(false)}
          onSuccess={() => loadData()}
        />
      )}
    </div>
  );
}
