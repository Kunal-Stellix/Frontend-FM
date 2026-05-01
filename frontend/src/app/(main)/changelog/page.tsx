"use client";

import { useEffect, useState } from "react";
import { fetchChangelog } from "@/lib/feedbackApi";
import type { Changelog, ChangelogEntryType } from "@/types/admin";
import { ChangelogEntry } from "@/components/changelog/ChangelogEntry";
import { SubscribeForm } from "@/components/changelog/SubscribeForm";
import { Rocket } from "lucide-react";

type FilterTab = "all" | ChangelogEntryType;

export default function ChangelogPage() {
  const [entries, setEntries] = useState<Changelog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchChangelog(activeFilter);
        if (active) setEntries(data);
      } catch {
        if (active) setError("Failed to load changelog.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [activeFilter]);

  const tabs: { value: FilterTab; label: string }[] = [
    { value: "all", label: "All Updates" },
    { value: "new_feature", label: "New Features" },
    { value: "improvement", label: "Improvements" },
    { value: "bug_fix", label: "Bug Fixes" },
  ];

  const scrollToSubscribe = () => {
    document.getElementById("changelog-subscribe")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Changelog
            </span>
          </div>
          <h1 className="text-4xl font-bold text-base-content mb-4">
            What&apos;s new?
          </h1>
          <p className="text-lg text-base-content/60">
            Keep track of the latest updates, improvements, and fixes we&apos;ve made to the platform.
          </p>
          <button onClick={scrollToSubscribe} className="btn btn-primary mt-6">
            Subscribe for release updates
          </button>
        </div>
        
        <div className="w-full md:w-80 shrink-0 mt-4 md:mt-0">
          <SubscribeForm id="changelog-subscribe" />
        </div>
      </div>

      <div className="tabs tabs-boxed bg-base-200/50 p-1 inline-flex mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            className={`tab tab-sm sm:tab-md font-medium transition-all ${
              activeFilter === tab.value 
                ? "tab-active bg-base-100 text-base-content shadow-sm" 
                : "text-base-content/60 hover:text-base-content"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative">
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-error font-medium">{error}</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-base-content/50 border-2 border-dashed border-base-200 rounded-2xl">
            No updates found for this filter.
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <ChangelogEntry key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
