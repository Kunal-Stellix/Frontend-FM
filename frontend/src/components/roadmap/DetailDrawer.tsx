"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, ArrowRight, ChevronUp, MessageSquare } from "lucide-react";
import type { RoadmapItem } from "@/types/idea";
import { StatusBadge } from "@/components/shared/StatusBadge";

type DetailDrawerProps = {
  item: RoadmapItem | null;
  isOpen: boolean;
  onClose: () => void;
};

export function DetailDrawer({ item, isOpen, onClose }: DetailDrawerProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-base-300/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md h-full bg-base-100 shadow-2xl flex flex-col transform transition-transform border-l border-base-200">
        <div className="flex items-center justify-between p-4 border-b border-base-200">
          <h2 className="font-bold text-lg text-base-content">Item Details</h2>
          <button 
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {item && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={item.status} />
              <span className="text-sm text-base-content/50">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-base-content mb-2">{item.title}</h3>
              <p className="text-sm text-base-content/80 whitespace-pre-wrap leading-relaxed">
                {item.description || item.excerpt}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {item.categories.map((cat) => (
                <span key={cat.id} className="badge badge-outline text-xs">
                  {cat.label}
                </span>
              ))}
            </div>

            <div className="flex gap-4 p-4 bg-base-200/50 rounded-xl mt-4">
              <div className="flex flex-col">
                <span className="text-xs text-base-content/50 font-medium mb-1">Votes</span>
                <div className={`badge gap-1 font-bold ${item.hasVoted ? "badge-primary" : "badge-ghost bg-base-200"}`}>
                  <ChevronUp className="h-3 w-3" strokeWidth={item.hasVoted ? 3 : 2} />
                  {item.voteCount}
                </div>
              </div>
              <div className="w-px bg-base-300"></div>
              <div className="flex flex-col">
                <span className="text-xs text-base-content/50 font-medium mb-1">Comments</span>
                <div className="flex items-center gap-1 font-bold text-sm text-base-content/80">
                  <MessageSquare className="h-4 w-4" />
                  {item.commentCount}
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6">
              <Link 
                href={`/feedback/${item.id}`} 
                className="btn btn-primary w-full"
                onClick={onClose}
              >
                View full thread <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
