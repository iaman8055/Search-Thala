export type Category = "top" | "business" | "sports" | "technology";

export const CATEGORIES: { key: Category; label: string }[] = [
  { key: "top", label: "Top" },
  { key: "business", label: "Business" },
  { key: "sports", label: "Sports" },
  { key: "technology", label: "Technology" },
];

export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: Category;
  tag: string;
  publishedAt: string;
  likes: number;
  liked: boolean;
}

export interface ArticlesResponse {
  articles: ArticleSummary[];
  hasMore: boolean;
  page: number;
}
