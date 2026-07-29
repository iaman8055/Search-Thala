"use client";

import { useEffect, useRef, useState } from "react";
import { ArticleCard } from "./ArticleCard";
import { AdCard } from "./AdSlot";
import { ArticleSummary } from "@/lib/types";
import { useDeviceId } from "@/lib/useDeviceId";
import { useGetArticlesQuery, useLikeArticleMutation } from "@/store/articlesApi";
import { articlesApi } from "@/store/articlesApi";
import { useAppDispatch } from "@/store/hooks";

const CATEGORY = "top" as const;

export function DesktopGrid() {
  const deviceId = useDeviceId();
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const [likeArticle] = useLikeArticleMutation();

  const { data, isLoading, isFetching } = useGetArticlesQuery({
    category: CATEGORY,
    page,
    deviceId,
  });

  const articles: ArticleSummary[] = data?.articles ?? [];
  const hasMore = data?.hasMore ?? false;
  const loadingMore = isFetching && page > 1;

  // Cards already committed to the DOM shouldn't replay their entrance
  // animation on unrelated re-renders (likes, etc) — only ids not yet seen
  // get the animate-in treatment, and this ref is updated after paint so
  // the render that introduces them still sees them as "new".
  const seenIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    articles.forEach((a) => seenIdsRef.current.add(a.id));
  }, [articles]);

  function handleLike(id: string) {
    const target = articles.find((a) => a.id === id);
    if (!target) return;

    dispatch(
      articlesApi.util.updateQueryData("getArticles", { category: CATEGORY, page: 1, deviceId }, (draft) => {
        const item = draft.articles.find((a) => a.id === id);
        if (item) {
          item.liked = !item.liked;
          item.likes += item.liked ? 1 : -1;
        }
      })
    );

    if (!deviceId) return;
    likeArticle({ id, deviceId });
  }

  const items: (
    | { kind: "article"; article: ArticleSummary; delayMs: number | null }
    | { kind: "ad"; key: string; delayMs: number | null }
  )[] = [];
  // An ad slot after every 3rd post.
  const POSTS_PER_AD = 3;
  // Desktop grid is 3 columns wide, so stagger by row (3 cards land
  // together) rather than card-by-card.
  const CARDS_PER_ROW = 3;
  let newCount = 0;
  let lastDelayMs: number | null = null;
  articles.forEach((article, idx) => {
    const isNew = !seenIdsRef.current.has(article.id);
    const delayMs = isNew ? Math.floor(newCount / CARDS_PER_ROW) * 120 : null;
    if (isNew) newCount++;
    lastDelayMs = delayMs;
    items.push({ kind: "article", article, delayMs });
    // Ad slots animate in with the same delay as the post row they land
    // in, so they arrive together instead of popping in on their own.
    if ((idx + 1) % POSTS_PER_AD === 0) items.push({ kind: "ad", key: `ad-${idx}`, delayMs: lastDelayMs });
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
      {isLoading ? (
        <div className="flex justify-center py-24">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) =>
              item.kind === "article" ? (
                <ArticleCard
                  key={item.article.id}
                  article={item.article}
                  onLike={handleLike}
                  className={item.delayMs !== null ? "animate-card-in" : undefined}
                  style={item.delayMs !== null ? { animationDelay: `${item.delayMs}ms` } : undefined}
                />
              ) : (
                <AdCard
                  key={item.key}
                  className={item.delayMs !== null ? "animate-card-in" : undefined}
                  style={item.delayMs !== null ? { animationDelay: `${item.delayMs}ms` } : undefined}
                />
              )
            )}
          </div>

          {articles.length === 0 && (
            <p className="mt-10 text-center text-slate-500">No articles yet.</p>
          )}

          {hasMore && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={loadingMore}
                className="rounded-full bg-blue-600 px-8 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}

          {!hasMore && articles.length > 0 && (
            <p className="py-8 text-center text-sm text-slate-600">You&apos;re all caught up.</p>
          )}
        </>
      )}
    </div>
  );
}
