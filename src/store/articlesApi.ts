import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ArticlesResponse, Category } from "@/lib/types";

export interface GetArticlesArgs {
  category: Category;
  page: number;
  deviceId: string;
  limit?: number;
}

export interface LikeArticleArgs {
  id: string;
  deviceId: string;
}

export interface LikeArticleResult {
  liked: boolean;
  likes: number;
}

export const articlesApi = createApi({
  reducerPath: "articlesApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    getArticles: builder.query<ArticlesResponse, GetArticlesArgs>({
      query: ({ category, page, deviceId, limit }) => {
        const params = new URLSearchParams({ category, page: String(page) });
        if (deviceId) params.set("deviceId", deviceId);
        if (limit) params.set("limit", String(limit));
        return `/articles?${params.toString()}`;
      },
      serializeQueryArgs: ({ queryArgs }) => `${queryArgs.category}:${queryArgs.limit ?? "default"}`,
      merge: (currentCache, newData, { arg }) => {
        if (arg.page <= 1) {
          currentCache.articles = newData.articles;
        } else {
          currentCache.articles.push(...newData.articles);
        }
        currentCache.hasMore = newData.hasMore;
        currentCache.page = newData.page;
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.page !== previousArg?.page,
    }),
    likeArticle: builder.mutation<LikeArticleResult, LikeArticleArgs>({
      query: ({ id, deviceId }) => ({
        url: `/articles/${id}/like`,
        method: "POST",
        body: { deviceId },
      }),
    }),
  }),
});

export const { useGetArticlesQuery, useLikeArticleMutation } = articlesApi;
