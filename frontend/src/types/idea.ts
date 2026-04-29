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

export type ApiIdeaStatus =
  | "idea"
  | "under-review"
  | "planned"
  | "in-progress"
  | "completed";

export type ApiIdeaSortOption = "votes" | "newest" | "updated" | "comments";

export type Category = {
  id: string;
  label: string;
  slug: string;
  color?: string;
};

export type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  created_at: string;
};

export type ApiAuthor = {
  id: string;
  name: string;
  avatar_url: string | null;
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

export type ApiIdea = {
  id: string;
  title: string;
  description: string | null;
  status: ApiIdeaStatus;
  author: ApiAuthor;
  category: ApiCategory | null;
  vote_count: number;
  comment_count: number;
  voted_by_me: boolean;
  created_at: string;
  updated_at: string;
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
  categoryId?: string | null;
};

export type DuplicateCheckResponse = {
  duplicates: Pick<Idea, "id" | "title" | "excerpt" | "voteCount" | "status">[];
};

export type ApiIdeaListResponse = {
  items: ApiIdea[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
};

export type ApiCreateIdeaRequest = {
  title: string;
  description?: string;
  category_id?: string;
};

export type ApiVoteResponse = {
  voted: boolean;
  vote_count: number;
};
