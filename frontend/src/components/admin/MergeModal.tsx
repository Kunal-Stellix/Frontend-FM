"use client";

import { useState } from "react";
import { mergeIdeas } from "@/lib/feedbackApi";
import type { AdminIdea } from "@/types/admin";
import { X, AlertTriangle } from "lucide-react";

type MergeModalProps = {
  primaryIdea: AdminIdea;
  allIdeas: AdminIdea[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function MergeModal({ primaryIdea, allIdeas, isOpen, onClose, onSuccess }: MergeModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const secondaryOptions = allIdeas.filter((idea) => idea.id !== primaryIdea.id);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleMerge = async () => {
    if (selectedIds.size === 0) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await mergeIdeas(primaryIdea.id, Array.from(selectedIds));
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to merge ideas");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-base-300/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-base-100 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-base-200">
          <div>
            <h2 className="font-bold text-xl text-base-content">Merge Ideas</h2>
            <p className="text-sm text-base-content/60 mt-1">
              Select duplicate ideas to merge into the primary idea.
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-primary mb-1 block">
              Primary Idea (Will be kept)
            </span>
            <h3 className="font-semibold text-base-content">{primaryIdea.title}</h3>
            <p className="text-sm text-base-content/70 mt-1 line-clamp-2">
              {primaryIdea.excerpt}
            </p>
          </div>

          <div className="flex items-center gap-2 text-warning mb-4 bg-warning/10 p-3 rounded-lg text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p>Selected ideas will be merged into the primary idea. Their votes and comments will be transferred. <strong>This action cannot be undone.</strong></p>
          </div>

          <h4 className="font-semibold text-sm mb-3 text-base-content">Select ideas to merge:</h4>
          
          {secondaryOptions.length === 0 ? (
            <p className="text-sm text-base-content/50 italic py-4">No other ideas available to merge.</p>
          ) : (
            <div className="space-y-2">
              {secondaryOptions.map((idea) => (
                <label 
                  key={idea.id} 
                  className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                    selectedIds.has(idea.id) 
                      ? "border-primary bg-primary/5" 
                      : "border-base-200 hover:bg-base-200/50"
                  }`}
                >
                  <input 
                    type="checkbox" 
                    className="checkbox checkbox-primary mt-0.5" 
                    checked={selectedIds.has(idea.id)}
                    onChange={() => toggleSelection(idea.id)}
                  />
                  <div>
                    <h5 className="font-medium text-sm text-base-content">{idea.title}</h5>
                    <p className="text-xs text-base-content/60 mt-1 line-clamp-1">{idea.excerpt}</p>
                    <div className="text-xs text-base-content/50 mt-2 font-medium">
                      {idea.voteCount} votes &bull; {idea.commentCount} comments
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
          
          {error && <p className="text-error text-sm mt-4 font-medium">{error}</p>}
        </div>

        <div className="p-6 border-t border-base-200 flex justify-end gap-3 bg-base-200/30 rounded-b-2xl">
          <button className="btn btn-ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleMerge}
            disabled={selectedIds.size === 0 || isSubmitting}
          >
            {isSubmitting ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              `Merge ${selectedIds.size} Idea${selectedIds.size !== 1 ? 's' : ''}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
