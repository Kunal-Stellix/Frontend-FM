export type IdeaStatus =
  | "under_review"
  | "planned"
  | "in_progress"
  | "shipped"
  | "declined";

export type SortOption =
  | "most_votes"
  | "newest"
  | "recently_updated"
  | "most_commented";

export type Category = {
  id: string;
  label: string;
  slug: string;
  color?: string;
};

export type Vote = {
  id: string;
  ideaId: string;
  userId: string;
  createdAt: string;
};

export type Idea = {
  id: string;
  title: string;
  description?: string;
  excerpt: string;
  status: IdeaStatus;
  voteCount: number;
  commentCount: number;
  hasVoted: boolean;
  categories: Category[];
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
};

export type IdeaListResponse = {
  ideas: Idea[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
};

export type SubmitIdeaPayload = {
  title: string;
  description?: string;
  categoryIds?: string[];
};

export type DuplicateCheckResponse = {
  duplicates: Pick<Idea, "id" | "title" | "excerpt" | "voteCount" | "status">[];
};
