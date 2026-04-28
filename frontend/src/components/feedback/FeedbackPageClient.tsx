"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Lightbulb, X } from "lucide-react";
import { fetchCategories, fetchIdeas, fetchStatusCounts, toggleVote, type StatusCounts } from "@/lib/feedbackApi";
import { hasStoredSession } from "@/lib/authStorage";
import type { Category, Idea, IdeaStatus, SortOption } from "@/types/idea";
import { CategoryFilterChips } from "./CategoryFilterChips";
import { IdeaList } from "./IdeaList";
import { IdeaSearchBar } from "./IdeaSearchBar";
import { SortControls } from "./SortControls";
import { StatusFilter } from "./StatusFilter";
import { SubmitIdeaModal } from "./SubmitIdeaModal";

/* ── Toast type ── */

type ToastTone = "info" | "success" | "warning" | "error";

type ToastItem = {
  id: number;
  tone: ToastTone;
  message: string;
  exiting?: boolean;
};

const TOAST_ALERT_CLASS: Record<ToastTone, string> = {
  info: "alert-info",
  success: "alert-success",
  warning: "alert-warning",
  error: "alert-error",
};

/* ── URL param helpers ── */

const SORT_OPTIONS: SortOption[] = [
  "most_votes",
  "newest",
  "recently_updated",
  "most_commented",
];

const STATUS_OPTIONS: IdeaStatus[] = [
  "under_review",
  "planned",
  "in_progress",
  "shipped",
  "declined",
];

const PAGE_SIZE = 6;

const parseListParam = (value: string | null) =>
  value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean) ?? [];

const sortParam = (value: string | null): SortOption =>
  value && SORT_OPTIONS.includes(value as SortOption)
    ? (value as SortOption)
    : "most_votes";

const statusParams = (value: string | null): IdeaStatus[] =>
  parseListParam(value).filter((item): item is IdeaStatus =>
    STATUS_OPTIONS.includes(item as IdeaStatus),
  );

/* ── Component ── */

export function FeedbackPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /* URL-derived state */
  const search = searchParams.get("search") ?? "";
  const sort = sortParam(searchParams.get("sort"));
  const categories = parseListParam(searchParams.get("categories"));
  const statuses = statusParams(searchParams.get("statuses"));
  const page = Math.max(Number(searchParams.get("page") ?? "1") || 1, 1);
  const isModalOpen = searchParams.get("compose") === "1";

  /* Local state */
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [total, setTotal] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCounts | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [votingIds, setVotingIds] = useState<string[]>([]);
  const [showVoteAuthPrompt, setShowVoteAuthPrompt] = useState(false);
  const [reloadNonce, setReloadNonce] = useState(0);
  const requestIdRef = useRef(0);
  const toastIdRef = useRef(0);

  const isLoggedIn = hasStoredSession();

  /* ── Toast helpers ── */

  const addToast = (tone: ToastTone, message: string) => {
    const id = ++toastIdRef.current;
    setToasts((current) => [...current, { id, tone, message }]);

    window.setTimeout(() => {
      setToasts((current) =>
        current.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
      );
      window.setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== id));
      }, 300);
    }, 3000);
  };

  const dismissToast = (id: number) => {
    setToasts((current) =>
      current.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
    );
    window.setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 300);
  };

  /* ── Data fetching ── */

  useEffect(() => {
    const loadCategories = async () => {
      const nextCategories = await fetchCategories();
      setAvailableCategories(nextCategories);
    };
    void loadCategories();
  }, []);

  useEffect(() => {
    const loadStatusCounts = async () => {
      const counts = await fetchStatusCounts({ search, categories });
      setStatusCounts(counts);
    };
    void loadStatusCounts();
  }, [categories, search]);

  useEffect(() => {
    if (!isModalOpen || isLoggedIn) return;
    router.replace(`/login?next=${encodeURIComponent(`${pathname}?compose=1`)}`);
  }, [isLoggedIn, isModalOpen, pathname, router]);

  useEffect(() => {
    const currentRequestId = ++requestIdRef.current;

    const loadIdeas = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchIdeas({
          search,
          sort,
          categories,
          statuses,
          page,
          pageSize: PAGE_SIZE,
        });

        if (requestIdRef.current !== currentRequestId) return;

        setIdeas((current) =>
          page === 1 ? response.ideas : [...current, ...response.ideas],
        );
        setTotal(response.total);
        setHasNextPage(response.hasNextPage);
      } catch (loadError) {
        if (requestIdRef.current !== currentRequestId) return;
        setError(
          loadError instanceof Error ? loadError.message : "Unable to load ideas.",
        );
        if (page === 1) setIdeas([]);
      } finally {
        if (requestIdRef.current === currentRequestId) setLoading(false);
      }
    };

    void loadIdeas();
  }, [categories, page, reloadNonce, search, sort, statuses]);

  /* ── URL sync ── */

  const replaceQuery = useMemo(
    () =>
      (updates: {
        search?: string | null;
        sort?: SortOption | null;
        categories?: string[] | null;
        statuses?: IdeaStatus[] | null;
        page?: number | null;
        compose?: boolean | null;
      }) => {
        const params = new URLSearchParams(searchParams.toString());

        if ("search" in updates) {
          const v = updates.search?.trim();
          v ? params.set("search", v) : params.delete("search");
        }
        if ("sort" in updates) {
          updates.sort && updates.sort !== "most_votes"
            ? params.set("sort", updates.sort)
            : params.delete("sort");
        }
        if ("categories" in updates) {
          updates.categories?.length
            ? params.set("categories", updates.categories.join(","))
            : params.delete("categories");
        }
        if ("statuses" in updates) {
          updates.statuses?.length
            ? params.set("statuses", updates.statuses.join(","))
            : params.delete("statuses");
        }
        if ("page" in updates) {
          updates.page && updates.page > 1
            ? params.set("page", String(updates.page))
            : params.delete("page");
        }
        if ("compose" in updates) {
          updates.compose ? params.set("compose", "1") : params.delete("compose");
        }

        const qs = params.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      },
    [pathname, router, searchParams],
  );

  /* ── Handlers ── */

  const handleOpenSubmit = () => {
    if (!isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent(`${pathname}?compose=1`)}`);
      return;
    }
    replaceQuery({ compose: true });
  };

  const handleCloseSubmit = () => replaceQuery({ compose: false });

  const handleVoteToggle = async (ideaId: string) => {
    if (!isLoggedIn) {
      setShowVoteAuthPrompt(true);
      return;
    }

    const snapshot = ideas.find((idea) => idea.id === ideaId);
    if (!snapshot) return;

    /* Optimistic update */
    setVotingIds((c) => [...c, ideaId]);
    setIdeas((current) =>
      current.map((idea) =>
        idea.id === ideaId
          ? {
              ...idea,
              hasVoted: !idea.hasVoted,
              voteCount: idea.voteCount + (idea.hasVoted ? -1 : 1),
            }
          : idea,
      ),
    );

    try {
      const result = await toggleVote(ideaId);
      setIdeas((current) =>
        current.map((idea) =>
          idea.id === ideaId
            ? { ...idea, voteCount: result.voteCount, hasVoted: result.hasVoted }
            : idea,
        ),
      );
    } catch (voteError) {
      /* Rollback */
      setIdeas((current) =>
        current.map((idea) =>
          idea.id === ideaId
            ? { ...idea, voteCount: snapshot.voteCount, hasVoted: snapshot.hasVoted }
            : idea,
        ),
      );
      addToast(
        "error",
        voteError instanceof Error ? voteError.message : "Unable to update vote right now.",
      );
    } finally {
      setVotingIds((c) => c.filter((id) => id !== ideaId));
    }
  };

  /* ── Render ── */

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* ── Hero ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Product feedback
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-bold text-base-content sm:text-3xl">
            Ideas & Feature Requests
          </h1>
          <p className="mt-1 text-sm text-base-content/60">
            Browse requests, upvote your favourites, and submit the next thing we should build.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="badge badge-outline badge-lg tabular-nums gap-1.5">
            <span className="font-bold">{total}</span>
            ideas
          </div>
          <button type="button" className="btn btn-primary btn-sm sm:btn-md" onClick={handleOpenSubmit}>
            + Submit idea
          </button>
        </div>
      </div>

      {/* ── Search ── */}
      <IdeaSearchBar
        key={search}
        value={search}
        onChange={(value) => replaceQuery({ search: value, page: 1 })}
      />

      {/* ── Main grid: sidebar + content ── */}
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          {/* Categories */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-base-content/50 px-2 mb-2">
              Categories
            </h2>
            <CategoryFilterChips
              categories={availableCategories}
              selected={categories}
              onChange={(next) => replaceQuery({ categories: next, page: 1 })}
            />
          </div>

          {/* Divider */}
          <div className="divider my-0" />

          {/* Status */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-base-content/50 px-2 mb-2">
              Status
            </h2>
            <StatusFilter
              selected={statuses}
              onChange={(next) => replaceQuery({ statuses: next, page: 1 })}
              counts={statusCounts ?? undefined}
            />
          </div>
        </aside>

        {/* Main content */}
        <div className="space-y-4">
          {/* Sort tabs */}
          <div className="flex items-center justify-between gap-4">
            <SortControls
              value={sort}
              onChange={(next) => replaceQuery({ sort: next, page: 1 })}
            />
            <p className="text-xs text-base-content/40 tabular-nums hidden sm:block">
              {total} results
            </p>
          </div>

          {/* Idea list */}
          <IdeaList
            ideas={ideas}
            loading={loading}
            error={error}
            hasNextPage={hasNextPage}
            onLoadMore={() => replaceQuery({ page: page + 1 })}
            onVoteToggle={handleVoteToggle}
            onRetry={() => setReloadNonce((c) => c + 1)}
            onOpenSubmit={handleOpenSubmit}
            isLoggedIn={isLoggedIn}
            votingIds={votingIds}
            onOpenDetails={() =>
              addToast("info", "Idea detail pages are coming soon. Browse and vote here for now.")
            }
          />
        </div>
      </div>

      {/* ── Submit Modal ── */}
      {isModalOpen ? (
        <SubmitIdeaModal
          isOpen={isModalOpen}
          onClose={handleCloseSubmit}
          onSuccess={(newIdea) => {
            addToast("success", "Your idea was submitted successfully!");
            setIdeas((c) => [newIdea, ...c]);
            setTotal((c) => c + 1);
            setHasNextPage(true);
            replaceQuery({ compose: false, page: 1 });
          }}
          categories={availableCategories}
          listHref={pathname}
        />
      ) : null}

      {/* ── Vote Auth Prompt ── */}
      {showVoteAuthPrompt ? (
        <dialog className="modal modal-open" open>
          <div className="modal-box max-w-md">
            <h3 className="text-lg font-bold text-base-content">Sign in to vote</h3>
            <p className="mt-2 text-sm text-base-content/60">
              Voting is available for signed-in users so we can keep idea momentum tied to real accounts.
            </p>
            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowVoteAuthPrompt(false)}
              >
                Maybe later
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => router.push(`/login?next=${encodeURIComponent(pathname)}`)}
              >
                Go to login
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button type="button" onClick={() => setShowVoteAuthPrompt(false)}>close</button>
          </form>
        </dialog>
      ) : null}

      {/* ── Toast stack ── */}
      {toasts.length > 0 ? (
        <div className="toast toast-end toast-top z-50">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              role="alert"
              className={`alert ${TOAST_ALERT_CLASS[toast.tone]} shadow-lg ${
                toast.exiting ? "fb-toast-exit" : "fb-toast"
              }`}
            >
              <span className="text-sm">{toast.message}</span>
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-circle"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
