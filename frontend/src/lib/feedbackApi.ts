import axios from "axios";
import { apiClient } from "@/lib/apiClient";
import { hasStoredSession } from "@/lib/authStorage";
import type {
  ApiCategory,
  ApiComment,
  ApiCommentListResponse,
  ApiCreateCommentRequest,
  ApiCreateIdeaRequest,
  ApiIdea,
  ApiIdeaListResponse,
  ApiIdeaSortOption,
  ApiIdeaStatus,
  ApiVoteResponse,
  Category,
  Comment,
  DuplicateCheckResponse,
  Idea,
  IdeaListResponse,
  IdeaStatus,
  RoadmapItem,
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

type IdeaQueryVariant = {
  categoryId: string | null;
  status: ApiIdeaStatus | null;
};

const DEFAULT_PAGE_SIZE = 6;
const AGGREGATE_PAGE_SIZE = 100;

const EMPTY_STATUS_COUNTS: StatusCounts = {
  under_review: 0,
  planned: 0,
  in_progress: 0,
  shipped: 0,
  declined: 0,
};

const FRONTEND_TO_API_SORT: Record<SortOption, ApiIdeaSortOption> = {
  most_votes: "votes",
  newest: "newest",
  recently_updated: "updated",
  most_commented: "comments",
};

const FRONTEND_TO_API_STATUSES: Record<IdeaStatus, ApiIdeaStatus[]> = {
  under_review: ["under_review"],
  planned: ["planned"],
  in_progress: ["in_progress"],
  shipped: ["shipped"],
  declined: ["declined"],
};

let categoriesCache: Category[] | null = null;

const getErrorDetail = (error: unknown) => {
  if (!axios.isAxiosError(error)) return null;

  const detail = error.response?.data?.detail;
  return typeof detail === "string" && detail.trim().length > 0 ? detail : null;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const detail = getErrorDetail(error);
  if (detail) return detail;
  if (axios.isAxiosError(error) && error.message) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

const buildIdeaExcerpt = (idea: Pick<ApiIdea, "title" | "description">) => {
  const summary = idea.description?.trim() || idea.title.trim();
  return summary.length > 120 ? `${summary.slice(0, 117).trimEnd()}...` : summary;
};

const mapApiCategory = (category: ApiCategory): Category => ({
  id: category.id,
  label: category.name,
  slug: category.slug,
  color: category.color ?? undefined,
});

const mapApiStatusToIdeaStatus = (status: ApiIdeaStatus): IdeaStatus => {
  switch (status) {
    case "under_review":
      return "under_review";
    case "planned":
      return "planned";
    case "in_progress":
      return "in_progress";
    case "shipped":
      return "shipped";
    case "declined":
      return "declined";
    default:
      return "under_review";
  }
};

const mapApiIdea = (idea: ApiIdea): Idea => ({
  id: idea.id,
  title: idea.title,
  description: idea.description ?? undefined,
  excerpt: buildIdeaExcerpt(idea),
  status: mapApiStatusToIdeaStatus(idea.status),
  voteCount: idea.vote_count,
  commentCount: idea.comment_count,
  hasVoted: idea.voted_by_me,
  categories: idea.category ? [mapApiCategory(idea.category)] : [],
  authorId: idea.author.id,
  authorName: idea.author.name,
  createdAt: idea.created_at,
  updatedAt: idea.updated_at,
});

const mapApiComment = (comment: ApiComment): Comment => ({
  id: comment.id,
  ideaId: comment.idea_id,
  content: comment.content,
  authorId: comment.author.id,
  authorName: comment.author.name,
  authorAvatar: comment.author.avatar_url,
  parentId: comment.parent_id,
  createdAt: comment.created_at,
});

const syncIdeaVoteStatus = async (idea: Idea) => {
  try {
    const response = await apiClient.get<{ voted: boolean }>(`/ideas/${idea.id}/vote`);
    return { ...idea, hasVoted: response.data.voted };
  } catch {
    return idea;
  }
};

const syncIdeasVoteStatus = async (ideas: Idea[]) => {
  if (!hasStoredSession() || ideas.length === 0) {
    return ideas;
  }

  return Promise.all(ideas.map(syncIdeaVoteStatus));
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

const dedupeIdeas = (ideas: Idea[]) => {
  const seen = new Set<string>();
  return ideas.filter((idea) => {
    if (seen.has(idea.id)) return false;
    seen.add(idea.id);
    return true;
  });
};

const mapIdeaListResponse = async (response: ApiIdeaListResponse): Promise<IdeaListResponse> => ({
  ideas: await syncIdeasVoteStatus(response.items.map(mapApiIdea)),
  total: response.total,
  page: response.page,
  pageSize: response.page_size,
  hasNextPage: response.has_next,
});

const buildIdeaQueryParams = (
  variant: IdeaQueryVariant,
  params: {
    search?: string;
    sort: SortOption;
    page: number;
    pageSize: number;
  },
) => {
  const query: Record<string, string | number> = {
    sort: FRONTEND_TO_API_SORT[params.sort],
    page: params.page,
    page_size: params.pageSize,
  };

  const search = params.search?.trim();
  if (search) query.q = search;
  if (variant.categoryId) query.category_id = variant.categoryId;
  if (variant.status) query.status = variant.status;

  return query;
};

const fetchIdeaListPage = async (
  variant: IdeaQueryVariant,
  params: {
    search?: string;
    sort: SortOption;
    page: number;
    pageSize: number;
  },
) => {
  const response = await apiClient.get<ApiIdeaListResponse>("/ideas", {
    params: buildIdeaQueryParams(variant, params),
  });

  return response.data;
};

const fetchAllIdeasForVariant = async (
  variant: IdeaQueryVariant,
  params: {
    search?: string;
    sort: SortOption;
  },
) => {
  const ideas: Idea[] = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const response = await fetchIdeaListPage(variant, {
      ...params,
      page,
      pageSize: AGGREGATE_PAGE_SIZE,
    });

    ideas.push(...response.items.map(mapApiIdea));
    hasNext = response.has_next;
    page += 1;
  }

  return ideas;
};

const getCategoriesWithCache = async () => {
  if (categoriesCache) return categoriesCache;

  const response = await apiClient.get<ApiCategory[]>("/categories");
  categoriesCache = response.data.map(mapApiCategory);
  return categoriesCache;
};

const resolveCategoryIds = async (slugs: string[]) => {
  if (slugs.length === 0) return [];

  const categories = await getCategoriesWithCache();
  const selectedSlugs = new Set(slugs);

  return categories
    .filter((category) => selectedSlugs.has(category.slug))
    .map((category) => category.id);
};

const getBackendStatuses = (statuses: IdeaStatus[]) =>
  [...new Set(statuses.flatMap((status) => FRONTEND_TO_API_STATUSES[status]))];

const buildQueryVariants = async ({
  categories,
  statuses,
}: Pick<FetchIdeasParams, "categories" | "statuses">) => {
  const selectedCategories = categories ?? [];
  const selectedStatuses = statuses ?? [];

  const categoryIds = await resolveCategoryIds(selectedCategories);
  if (selectedCategories.length > 0 && categoryIds.length === 0) {
    return [] satisfies IdeaQueryVariant[];
  }

  const backendStatuses = getBackendStatuses(selectedStatuses);
  if (selectedStatuses.length > 0 && backendStatuses.length === 0) {
    return [] satisfies IdeaQueryVariant[];
  }

  const categoryVariants = categoryIds.length > 0 ? categoryIds : [null];
  const statusVariants = backendStatuses.length > 0 ? backendStatuses : [null];

  return categoryVariants.flatMap((categoryId) =>
    statusVariants.map((status) => ({ categoryId, status })),
  );
};

const sumVariantTotals = async (
  variants: IdeaQueryVariant[],
  params: {
    search?: string;
    sort: SortOption;
  },
) => {
  const responses = await Promise.all(
    variants.map((variant) =>
      fetchIdeaListPage(variant, {
        ...params,
        page: 1,
        pageSize: 1,
      }),
    ),
  );

  return responses.reduce((total, response) => total + response.total, 0);
};

export async function fetchIdeas(params: FetchIdeasParams = {}): Promise<IdeaListResponse> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const sort = params.sort ?? "most_votes";

  try {
    const variants = await buildQueryVariants({
      categories: params.categories,
      statuses: params.statuses,
    });

    if (variants.length === 0) {
      return {
        ideas: [],
        total: 0,
        page,
        pageSize,
        hasNextPage: false,
      };
    }

    if (variants.length === 1) {
      const response = await fetchIdeaListPage(variants[0], {
        search: params.search,
        sort,
        page,
        pageSize,
      });
      return await mapIdeaListResponse(response);
    }

    const aggregatedIdeas = await syncIdeasVoteStatus(dedupeIdeas(
      (
        await Promise.all(
          variants.map((variant) =>
            fetchAllIdeasForVariant(variant, {
              search: params.search,
              sort,
            }),
          ),
        )
      ).flat(),
    ));

    const sortedIdeas = sortIdeas(aggregatedIdeas, sort);
    const start = (page - 1) * pageSize;
    const paginatedIdeas = sortedIdeas.slice(start, start + pageSize);

    return {
      ideas: paginatedIdeas,
      total: sortedIdeas.length,
      page,
      pageSize,
      hasNextPage: start + pageSize < sortedIdeas.length,
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load ideas."));
  }
}

export async function fetchIdeaById(ideaId: string): Promise<Idea | null> {
  try {
    const response = await apiClient.get<ApiIdea>(`/ideas/${ideaId}`);
    const idea = mapApiIdea(response.data);
    return hasStoredSession() ? await syncIdeaVoteStatus(idea) : idea;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }

    throw new Error(getErrorMessage(error, "Unable to load idea details right now."));
  }
}

export async function searchIdeasByTitle(query: string): Promise<DuplicateCheckResponse> {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 2) {
    return { duplicates: [] };
  }

  try {
    const response = await apiClient.get<ApiIdea[]>("/ideas/search", {
      params: { q: trimmedQuery },
    });

    return {
      duplicates: response.data.slice(0, 3).map((idea) => {
        const mappedIdea = mapApiIdea(idea);
        return {
          id: mappedIdea.id,
          title: mappedIdea.title,
          excerpt: mappedIdea.excerpt,
          voteCount: mappedIdea.voteCount,
          status: mappedIdea.status,
        };
      }),
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to search similar ideas."));
  }
}

export async function submitIdea(payload: SubmitIdeaPayload): Promise<Idea> {
  const requestBody: ApiCreateIdeaRequest = {
    title: payload.title.trim(),
  };

  const description = payload.description?.trim();
  if (description) requestBody.description = description;
  if (payload.categoryId) requestBody.category_id = payload.categoryId;

  try {
    const response = await apiClient.post<ApiIdea>("/ideas", requestBody);
    const idea = mapApiIdea(response.data);
    return hasStoredSession() ? await syncIdeaVoteStatus(idea) : idea;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to submit your idea."));
  }
}

export async function toggleVote(
  ideaId: string,
  hasVoted: boolean,
): Promise<{ voteCount: number; hasVoted: boolean }> {
  try {
    const response = hasVoted
      ? await apiClient.delete<ApiVoteResponse>(`/ideas/${ideaId}/vote`)
      : await apiClient.post<ApiVoteResponse>(`/ideas/${ideaId}/vote`);

    return {
      voteCount: response.data.vote_count,
      hasVoted: response.data.voted,
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to update vote right now."));
  }
}

export async function getVoteStatus(ideaId: string): Promise<{ hasVoted: boolean }> {
  try {
    const response = await apiClient.get<{ voted: boolean }>(`/ideas/${ideaId}/vote`);
    return { hasVoted: response.data.voted };
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load vote status."));
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    return await getCategoriesWithCache();
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load categories."));
  }
}

export async function fetchStatusCounts(
  params: Pick<FetchIdeasParams, "search" | "categories"> = {},
): Promise<StatusCounts> {
  try {
    const counts = { ...EMPTY_STATUS_COUNTS };
    const frontendStatuses: IdeaStatus[] = [
      "under_review",
      "planned",
      "in_progress",
      "shipped",
      "declined",
    ];

    await Promise.all(
      frontendStatuses.map(async (status) => {
        const variants = await buildQueryVariants({
          categories: params.categories,
          statuses: [status],
        });

        if (variants.length === 0) {
          counts[status] = 0;
          return;
        }

        counts[status] = await sumVariantTotals(variants, {
          search: params.search,
          sort: "most_votes",
        });
      }),
    );

    return counts;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load status counts."));
  }
}

export async function fetchIdeaComments(ideaId: string): Promise<Comment[]> {
  try {
    const response = await apiClient.get<ApiCommentListResponse>(`/ideas/${ideaId}/comments`);
    return response.data.items.map(mapApiComment);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load comments."));
  }
}

export async function submitComment(
  ideaId: string,
  payload: { content: string; parentId?: string | null }
): Promise<Comment> {
  const requestBody: ApiCreateCommentRequest = {
    content: payload.content.trim(),
    parent_id: payload.parentId || null,
  };

  try {
    const response = await apiClient.post<ApiComment>(`/ideas/${ideaId}/comments`, requestBody);
    return mapApiComment(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to post your comment."));
  }
}

export async function fetchRoadmap(): Promise<RoadmapItem[]> {
  try {
    const response = await fetchIdeas({
      statuses: ["planned", "in_progress", "shipped"],
      pageSize: 100,
      sort: "most_votes",
    });
    return response.ideas;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load roadmap."));
  }
}
