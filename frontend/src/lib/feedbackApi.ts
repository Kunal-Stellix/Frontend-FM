import { MOCK_CATEGORIES, MOCK_IDEAS } from "@/lib/mockData";
import type {
  Category,
  DuplicateCheckResponse,
  Idea,
  IdeaListResponse,
  IdeaStatus,
  SortOption,
  SubmitIdeaPayload,
} from "@/types/idea";

export type FetchIdeasParams = {
  search?: string;
  sort?: SortOption;
  categories?: string[];
  statuses?: IdeaStatus[];
  page?: number;
  pageSize?: number;
};

export type StatusCounts = Record<IdeaStatus, number>;

const DEFAULT_PAGE_SIZE = 6;
const currentIdeas = [...MOCK_IDEAS];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeSearch = (value: string) => value.trim().toLowerCase();

const filterIdeas = (
  params: Pick<FetchIdeasParams, "search" | "categories" | "statuses"> = {},
) => {
  const search = normalizeSearch(params.search ?? "");
  const categories = new Set(params.categories ?? []);
  const statuses = new Set(params.statuses ?? []);

  return currentIdeas.filter((idea) => {
    const matchesSearch =
      !search ||
      idea.title.toLowerCase().includes(search) ||
      idea.description?.toLowerCase().includes(search) ||
      idea.excerpt.toLowerCase().includes(search);

    const matchesCategories =
      categories.size === 0 ||
      idea.categories.some((category) => categories.has(category.slug));

    const matchesStatuses = statuses.size === 0 || statuses.has(idea.status);

    return matchesSearch && matchesCategories && matchesStatuses;
  });
};

const sortIdeas = (ideas: Idea[], sort: SortOption) => {
  const nextIdeas = [...ideas];

  switch (sort) {
    case "newest":
      nextIdeas.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
      break;
    case "recently_updated":
      nextIdeas.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
      break;
    case "most_commented":
      nextIdeas.sort((a, b) => b.commentCount - a.commentCount);
      break;
    case "most_votes":
    default:
      nextIdeas.sort((a, b) => b.voteCount - a.voteCount);
      break;
  }

  return nextIdeas;
};

export async function fetchIdeas(params: FetchIdeasParams = {}): Promise<IdeaListResponse> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const sort = params.sort ?? "most_votes";
  const filteredIdeas = filterIdeas(params);

  const sortedIdeas = sortIdeas(filteredIdeas, sort);
  const start = (page - 1) * pageSize;
  const ideas = sortedIdeas.slice(start, start + pageSize);

  return {
    ideas,
    total: sortedIdeas.length,
    page,
    pageSize,
    hasNextPage: start + pageSize < sortedIdeas.length,
  };
}

export async function fetchIdeaById(ideaId: string): Promise<Idea | null> {
  await sleep(120);
  const idea = currentIdeas.find((entry) => entry.id === ideaId);
  return idea ?? null;
}

export async function searchIdeasByTitle(query: string): Promise<DuplicateCheckResponse> {
  await sleep(200);

  const search = normalizeSearch(query);

  if (search.length < 3) {
    return { duplicates: [] };
  }

  const duplicates = currentIdeas
    .filter((idea) => idea.title.toLowerCase().includes(search))
    .slice(0, 3)
    .map(({ id, title, excerpt, voteCount, status }) => ({
      id,
      title,
      excerpt,
      voteCount,
      status,
    }));

  return { duplicates };
}

export async function submitIdea(payload: SubmitIdeaPayload): Promise<Idea> {
  await sleep(600);

  const title = payload.title.trim();

  if (title.toLowerCase().includes("error")) {
    throw new Error("Mock submission failed. Please try a different title.");
  }

  const categories = (payload.categoryIds ?? [])
    .map((categoryId) => MOCK_CATEGORIES.find((category) => category.id === categoryId))
    .filter((category): category is Category => Boolean(category));

  const createdAt = new Date().toISOString();
  const newIdea: Idea = {
    id: Date.now().toString(),
    title,
    description: payload.description?.trim() || undefined,
    excerpt: (payload.description?.trim() || "New feedback submitted by the team.").slice(0, 120),
    status: "under_review",
    voteCount: 1,
    commentCount: 0,
    hasVoted: true,
    categories,
    authorId: "current-user",
    authorName: "You",
    createdAt,
    updatedAt: createdAt,
  };

  currentIdeas.unshift(newIdea);
  return newIdea;
}

export async function toggleVote(
  ideaId: string,
): Promise<{ voteCount: number; hasVoted: boolean }> {
  await sleep(150);

  const target = currentIdeas.find((idea) => idea.id === ideaId);

  if (!target) {
    throw new Error("Idea not found.");
  }

  if (ideaId.endsWith("7")) {
    throw new Error("Mock vote update failed.");
  }

  target.hasVoted = !target.hasVoted;
  target.voteCount += target.hasVoted ? 1 : -1;

  return { voteCount: target.voteCount, hasVoted: target.hasVoted };
}

export async function fetchCategories(): Promise<Category[]> {
  return MOCK_CATEGORIES;
}

export async function fetchStatusCounts(
  params: Pick<FetchIdeasParams, "search" | "categories"> = {},
): Promise<StatusCounts> {
  const scopedIdeas = filterIdeas({ search: params.search, categories: params.categories });

  return scopedIdeas.reduce<StatusCounts>(
    (counts, idea) => {
      counts[idea.status] += 1;
      return counts;
    },
    {
      under_review: 0,
      planned: 0,
      in_progress: 0,
      shipped: 0,
      declined: 0,
    },
  );
}
