"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  bootstrapWidgetSession,
  fetchCategories,
  fetchChangelog,
  fetchIdeas,
  fetchPortalSettings,
  fetchRoadmap,
} from "@/lib/feedbackApi";
import { saveWidgetSession } from "@/lib/widgetAuth";
import type { Changelog, PortalSettings } from "@/types/admin";
import type { Category, Idea, RoadmapItem } from "@/types/idea";
import type { WidgetSession, WidgetTab } from "@/types/widget";
import { WidgetBrowseTab } from "./WidgetBrowseTab";
import { WidgetHeader } from "./WidgetHeader";
import { WidgetRoadmapTab } from "./WidgetRoadmapTab";
import { WidgetSubmitTab } from "./WidgetSubmitTab";
import { WidgetTabs } from "./WidgetTabs";
import { WidgetWhatsNewTab } from "./WidgetWhatsNewTab";

const DEFAULT_PORTAL: PortalSettings = {
  portalName: "Feedback Hub",
  logoUrl: null,
  brandColor: "#2563eb",
};

export function WidgetShell({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [session, setSession] = useState<WidgetSession | null>(null);
  const [portal, setPortal] = useState<PortalSettings>(DEFAULT_PORTAL);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [changelog, setChangelog] = useState<Changelog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestedTab = useMemo(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam === "submit" ||
      tabParam === "browse" ||
      tabParam === "roadmap" ||
      tabParam === "whats-new"
    ) {
      return tabParam;
    }
    return "submit";
  }, [searchParams]);
  const [manualTab, setManualTab] = useState<WidgetTab | null>(null);
  const activeTab = manualTab ?? requestedTab;

  const handleTabChange = (tab: WidgetTab) => {
    setManualTab(tab);

    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  useEffect(() => {
    let active = true;

    const loadWidget = async () => {
      try {
        const token = searchParams.get("token") || undefined;
        const [
          sessionResult,
          portalResult,
          categoryResult,
          ideasResult,
          roadmapResult,
          changelogResult,
        ] = await Promise.allSettled([
          bootstrapWidgetSession(token),
          fetchPortalSettings(),
          fetchCategories(),
          fetchIdeas({ pageSize: 6 }),
          fetchRoadmap(),
          fetchChangelog("all"),
        ]);

        if (!active) return;

        const sessionResponse = sessionResult.status === "fulfilled" ? sessionResult.value : null;
        saveWidgetSession(sessionResponse);
        setSession(sessionResponse);
        setPortal(portalResult.status === "fulfilled" ? portalResult.value : DEFAULT_PORTAL);
        setCategories(categoryResult.status === "fulfilled" ? categoryResult.value : []);
        setIdeas(ideasResult.status === "fulfilled" ? ideasResult.value.ideas : []);
        setRoadmap(roadmapResult.status === "fulfilled" ? roadmapResult.value : []);
        setChangelog(changelogResult.status === "fulfilled" ? changelogResult.value : []);

        if (
          categoryResult.status === "rejected" ||
          ideasResult.status === "rejected" ||
          roadmapResult.status === "rejected" ||
          changelogResult.status === "rejected"
        ) {
          setError("Some widget data is unavailable right now. Placeholder content is still usable.");
        } else {
          setError(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadWidget();

    return () => {
      active = false;
    };
  }, [searchParams]);

  useEffect(() => {
    document.documentElement.style.setProperty("--brand-color", portal.brandColor);
  }, [portal.brandColor]);

  return (
    <div className={`${embedded ? "text-base-content" : "min-h-screen bg-base-200/50 p-3 text-base-content sm:p-4"}`}>
      <div className={`mx-auto flex max-w-xl flex-col gap-3 ${embedded ? "" : "min-h-[calc(100vh-1.5rem)]"}`}>
        <WidgetHeader portal={portal} session={session} />
        <WidgetTabs value={activeTab} onChange={handleTabChange} />

        <main className="flex-1 rounded-[24px] border border-base-300 bg-base-100 p-4 sm:p-5">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : (
            <>
              {error ? (
                <div className="mb-4 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-base-content/80">
                  {error}
                </div>
              ) : null}

              {activeTab === "submit" ? (
                <WidgetSubmitTab categories={categories} hasWidgetSession={Boolean(session)} />
              ) : activeTab === "browse" ? (
                <WidgetBrowseTab ideas={ideas} />
              ) : activeTab === "roadmap" ? (
                <WidgetRoadmapTab items={roadmap} />
              ) : (
                <WidgetWhatsNewTab entries={changelog} />
              )}
            </>
          )}
        </main>

        <footer className="flex items-center justify-between rounded-[20px] border border-base-300 bg-base-100 px-4 py-3 text-sm text-base-content/60">
          <span>{session ? "Signed in through host token" : "Public preview mode"}</span>
          {embedded ? null : (
            <Link href="/ideas" className="font-semibold brand-text">
              Open full portal
            </Link>
          )}
        </footer>
      </div>
    </div>
  );
}
