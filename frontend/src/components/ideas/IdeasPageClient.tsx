"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Lightbulb, X } from "lucide-react";
import {
  fetchCategories,
  fetchIdeaById,
  fetchIdeas,
  fetchStatusCounts,
  toggleVote,
  type StatusCounts,
} from "@/lib/feedbackApi";
import { hasStoredSession, subscribeToAuthSession } from "@/lib/authStorage";
import type { Category, Idea, IdeaStatus, SortOption } from "@/types/idea";
import { CategoryFilterChips } from "./CategoryFilterChips";
import { IdeaDetailsModal } from "./IdeaDetailsModal";
import { IdeaList } from "./IdeaList";
import { IdeaSearchBar } from "./IdeaSearchBar";
import { SortControls } from "./SortControls";
import { StatusFilter } from "./StatusFilter";
import { SubmitIdeaModal } from "./SubmitIdeaModal";

type ToastTone = "info" | "success" | "warning" | "error";

type ToastItem = {
  id: number;
  tone: ToastTone;
  message: string;
  exiting?: boolean;
};

type DetailState = {
  ideaId: string;
  idea: Idea | null;
  error: string | null;
};

const TOAST_ALERT_CLASS: Record<ToastTone, string> = {
  info: "alert-info",
  success: "alert-success",
  warning: "alert-warning",
  error: "alert-error",
};

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

export function IdeasPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParam = searchParams.get("search");
  const sortValue = searchParams.get("sort");
  const categoriesParam = searchParams.get("categories");
  const statusesParam = searchParams.get("statuses");
  const pageParam = searchParams.get("page");
  const composeParam = searchParams.get("compose");
  const detailParam = searchParams.get("detail");

  const search = searchParam ?? "";
  const sort = sortParam(sortValue);
  const categories = useMemo(() => parseListParam(categoriesParam), [categoriesParam]);
  const statuses = useMemo(() => statusParams(statusesParam), [statusesParam]);
  const page = Math.max(Number(pageParam ?? "1") || 1, 1);
  const isModalOpen = composeParam === "1";

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [total, setTotal] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCounts | null>(null);
  const [detailState, setDetailState] = useState<DetailState | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [votingIds, setVotingIds] = useState<string[]>([]);
  const [showVoteAuthPrompt, setShowVoteAuthPrompt] = useState(false);
  const [reloadNonce, setReloadNonce] = useState(0);
  const requestIdRef = useRef(0);
  const toastIdRef = useRef(0);

  const isLoggedIn = useSyncExternalStore(
    subscribeToAuthSession,
    hasStoredSession,
    () => false,
  );

  const activeIdeaFromList = useMemo(
    () => (detailParam ? ideas.find((idea) => idea.id === detailParam) ?? null : null),
    [detailParam, ideas],
  );
  const fetchedDetailIdea =
    detailParam && detailState?.ideaId === detailParam ? detailState.idea : null;
  const fetchedDetailError =
    detailParam && detailState?.ideaId === detailParam ? detailState.error : null;
  const detailLoading = Boolean(
    detailParam && !activeIdeaFromList && detailState?.ideaId !== detailParam,
  );
  const activeIdea = activeIdeaFromList ?? fetchedDetailIdea;

  const addToast = (tone: ToastTone, message: string) => {
    const id = ++toastIdRef.current;
    setToasts((current) => [...current, { id, tone, message }]);

    window.setTimeout(() => {
      setToasts((current) =>
        current.map((toast) => (toast.id === id ? { ...toast, exiting: true } : toast)),
      );
      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, 300);
    }, 3000);
  };

  const dismissToast = (id: number) => {
    setToasts((current) =>
      current.map((toast) => (toast.id === id ? { ...toast, exiting: true } : toast)),
    );
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 300);
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const nextCategories = await fetchCategories();
        setAvailableCategories(nextCategories);
      } catch {
        setAvailableCategories([]);
      }
    };
    void loadCategories();
  }, []);

  useEffect(() => {
    const loadStatusCounts = async () => {
      try {
        const counts = await fetchStatusCounts({ search, categories });
        setStatusCounts(counts);
      } catch {
        setStatusCounts(null);
      }
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

        setIdeas((current) => (page === 1 ? response.ideas : [...current, ...response.ideas]));
        setTotal(response.total);
        setHasNextPage(response.hasNextPage);
      } catch (loadError) {
        if (requestIdRef.current !== currentRequestId) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load ideas.");
        if (page === 1) setIdeas([]);
      } finally {
        if (requestIdRef.current === currentRequestId) setLoading(false);
      }
    };

    void loadIdeas();
  }, [categories, page, reloadNonce, search, sort, statuses]);

  useEffect(() => {
    if (!detailParam || activeIdeaFromList) {
      return;
    }

    let active = true;
    const requestedIdeaId = detailParam;

    void fetchIdeaById(requestedIdeaId)
      .then((idea) => {
        if (!active) return;
        if (!idea) {
          setDetailState({
            ideaId: requestedIdeaId,
            idea: null,
            error: "We couldn't find that idea.",
          });
          return;
        }
        setDetailState({
          ideaId: requestedIdeaId,
          idea,
          error: null,
        });
      })
      .catch(() => {
        if (!active) return;
        setDetailState({
          ideaId: requestedIdeaId,
          idea: null,
          error: "Unable to load idea details right now.",
        });
      });

    return () => {
      active = false;
    };
  }, [activeIdeaFromList, detailParam]);

  const replaceQuery = useMemo(
    () =>
      (updates: {
        search?: string | null;
        sort?: SortOption | null;
        categories?: string[] | null;
        statuses?: IdeaStatus[] | null;
        page?: number | null;
        compose?: boolean | null;
        detail?: string | null;
      }) => {
        const params = new URLSearchParams(searchParams.toString());

        if ("search" in updates) {
          const value = updates.search?.trim();
          if (value) params.set("search", value);
          else params.delete("search");
        }
        if ("sort" in updates) {
          if (updates.sort && updates.sort !== "most_votes") {
            params.set("sort", updates.sort);
          } else {
            params.delete("sort");
          }
        }
        if ("categories" in updates) {
          if (updates.categories?.length) {
            params.set("categories", updates.categories.join(","));
          } else {
            params.delete("categories");
          }
        }
        if ("statuses" in updates) {
          if (updates.statuses?.length) {
            params.set("statuses", updates.statuses.join(","));
          } else {
            params.delete("statuses");
          }
        }
        if ("page" in updates) {
          if (updates.page && updates.page > 1) {
            params.set("page", String(updates.page));
          } else {
            params.delete("page");
          }
        }
        if ("compose" in updates) {
          if (updates.compose) params.set("compose", "1");
          else params.delete("compose");
        }
        if ("detail" in updates) {
          if (updates.detail) params.set("detail", updates.detail);
          else params.delete("detail");
        }

        const qs = params.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      },
    [pathname, router, searchParams],
  );

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

    const snapshot = ideas.find((idea) => idea.id === ideaId) ?? activeIdea;
    if (!snapshot) return;

    setVotingIds((current) => [...current, ideaId]);
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
    setDetailState((current) =>
      current && current.idea?.id === ideaId
        ? {
            ...current,
            idea: {
              ...current.idea,
              hasVoted: !current.idea.hasVoted,
              voteCount: current.idea.voteCount + (current.idea.hasVoted ? -1 : 1),
            },
          }
        : current,
    );

    try {
      const result = await toggleVote(ideaId, snapshot.hasVoted);
      setIdeas((current) =>
        current.map((idea) =>
          idea.id === ideaId
            ? { ...idea, voteCount: result.voteCount, hasVoted: result.hasVoted }
            : idea,
        ),
      );
      setDetailState((current) =>
        current && current.idea?.id === ideaId
          ? {
              ...current,
              idea: {
                ...current.idea,
                voteCount: result.voteCount,
                hasVoted: result.hasVoted,
              },
            }
          : current,
      );
    } catch (voteError) {
      setIdeas((current) =>
        current.map((idea) =>
          idea.id === ideaId
            ? { ...idea, voteCount: snapshot.voteCount, hasVoted: snapshot.hasVoted }
            : idea,
        ),
      );
      setDetailState((current) =>
        current && current.idea?.id === ideaId
          ? {
              ...current,
              idea: {
                ...current.idea,
                voteCount: snapshot.voteCount,
                hasVoted: snapshot.hasVoted,
              },
            }
          : current,
      );
      addToast(
        "error",
        voteError instanceof Error ? voteError.message : "Unable to update vote right now.",
      );
    } finally {
      setVotingIds((current) => current.filter((id) => id !== ideaId));
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
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
          <div className="badge badge-outline badge-lg gap-1.5 tabular-nums">
            <span className="font-bold">{total}</span>
            ideas
          </div>
          <button type="button" className="btn btn-primary btn-sm sm:btn-md" onClick={handleOpenSubmit}>
            + Submit idea
          </button>
        </div>
      </div>

      <IdeaSearchBar
        key={search}
        value={search}
        onChange={(value) => replaceQuery({ search: value, page: 1 })}
      />

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-base-300/70 bg-base-100/70 p-4 shadow-sm">
            <h2 className="mb-3 px-2 text-sm font-bold uppercase tracking-[0.22em] text-base-content/70">
              Categories
            </h2>
            <CategoryFilterChips
              categories={availableCategories}
              selected={categories}
              onChange={(next) => replaceQuery({ categories: next, page: 1 })}
            />
          </div>

          <div className="divider my-0" />

          <div className="rounded-2xl border border-base-300/70 bg-base-100/70 p-4 shadow-sm">
            <h2 className="mb-3 px-2 text-sm font-bold uppercase tracking-[0.22em] text-base-content/70">
              Status
            </h2>
            <StatusFilter
              selected={statuses}
              onChange={(next) => replaceQuery({ statuses: next, page: 1 })}
              counts={statusCounts ?? undefined}
            />
          </div>
        </aside>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <SortControls
              value={sort}
              onChange={(next) => replaceQuery({ sort: next, page: 1 })}
            />
            <p className="hidden text-xs tabular-nums text-base-content/40 sm:block">
              {total} results
            </p>
          </div>

          <IdeaList
            ideas={ideas}
            loading={loading}
            error={error}
            hasNextPage={hasNextPage}
            onLoadMore={() => replaceQuery({ page: page + 1 })}
            onVoteToggle={handleVoteToggle}
            onRetry={() => setReloadNonce((current) => current + 1)}
            onOpenSubmit={handleOpenSubmit}
            isLoggedIn={isLoggedIn}
            votingIds={votingIds}
            onOpenDetails={(ideaId) => replaceQuery({ detail: ideaId })}
          />
        </div>
      </div>

      <IdeaDetailsModal
        open={Boolean(detailParam)}
        idea={activeIdea}
        loading={detailLoading}
        error={activeIdeaFromList ? null : fetchedDetailError}
        isLoggedIn={isLoggedIn}
        isVoting={Boolean(activeIdea && votingIds.includes(activeIdea.id))}
        onVoteToggle={handleVoteToggle}
        onClose={() => replaceQuery({ detail: null })}
      />

      {isModalOpen ? (
        <SubmitIdeaModal
          isOpen={isModalOpen}
          onClose={handleCloseSubmit}
          onSuccess={(newIdea) => {
            addToast("success", "Your idea was submitted successfully!");
            setIdeas((current) => [newIdea, ...current]);
            setTotal((current) => current + 1);
            setHasNextPage(true);
            replaceQuery({ compose: false, page: 1 });
          }}
          categories={availableCategories}
          listHref={pathname}
        />
      ) : null}

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
