export type Post = {
  id: number;
  userId: number | null;
  title: string | null;
  content: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type PostsCellProps = {
  count: number | null;
  posts: Post[];
  isLoading: boolean;
};

export type GetPostsData = { posts: Post[] };
export type GetPostsVars = { filters: Record<string, unknown> };
