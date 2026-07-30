"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useSwipeable } from "react-swipeable";
import { CategoryTabs } from "./CategoryTabs";
import { AdReelSlide } from "./AdSlot";
import { HeartIcon, ShareIcon, CalendarIcon, SearchIcon, HomeIcon, ProfileIcon } from "./icons";
import { ArticleSummary, CATEGORIES, Category } from "@/lib/types";
import { useDeviceId } from "@/lib/useDeviceId";
import { timeAgo } from "@/lib/formatTime";
import { articlesApi, useGetArticlesQuery, useLikeArticleMutation } from "@/store/articlesApi";
import { useAppDispatch } from "@/store/hooks";

const FEED_LIMIT = 50;

// One ad slide is woven into the feed after every 3 posts.
const POSTS_PER_AD = 3;
// One ad slide gates category swipes after every 3 of them too.
const CATEGORY_SWIPES_PER_AD = 3;

type Slide = { kind: "article"; article: ArticleSummary } | { kind: "ad"; key: string };

function CategoryFeed({
  category,
  deviceId,
  onCategoryChange,
  onSelectCategory,
}: {
  category: Category;
  deviceId: string;
  onCategoryChange: (direction: 1 | -1) => void;
  onSelectCategory: (category: Category) => void;
}) {
  const [index, setIndex] = useState(0);
  const [prevCategory, setPrevCategory] = useState(category);
  const [swipeDirection, setSwipeDirection] = useState<1 | -1>(1);
  const dispatch = useAppDispatch();
  const [likeArticle] = useLikeArticleMutation();

  // Reset the article index when switching categories, without an effect or
  // remounting the component (which would tear down the whole post/tabs/nav).
  if (category !== prevCategory) {
    setPrevCategory(category);
    setIndex(0);
  }

  const { currentData, isFetching } = useGetArticlesQuery({
    category,
    page: 1,
    deviceId,
    limit: FEED_LIMIT,
  });

  const articles = currentData?.articles ?? [];
  const postLoading = isFetching && articles.length === 0;

  const slides: Slide[] = [];
  articles.forEach((a, i) => {
    slides.push({ kind: "article", article: a });
    if ((i + 1) % POSTS_PER_AD === 0) slides.push({ kind: "ad", key: `ad-${i}` });
  });

  const currentSlide = slides[index];
  const article = currentSlide?.kind === "article" ? currentSlide.article : undefined;

  function goToSlide(direction: 1 | -1) {
    if (slides.length === 0) return;
    setSwipeDirection(direction);
    setIndex((prev) => (prev + direction + slides.length) % slides.length);
  }

  const reelAnimClass = swipeDirection === 1 ? "animate-reel-in-up" : "animate-reel-in-down";

  function handleLike() {
    if (!article) return;
    const id = article.id;

    dispatch(
      articlesApi.util.updateQueryData(
        "getArticles",
        { category, page: 1, deviceId, limit: FEED_LIMIT },
        (draft) => {
          const item = draft.articles.find((a) => a.id === id);
          if (item) {
            item.liked = !item.liked;
            item.likes += item.liked ? 1 : -1;
          }
        }
      )
    );

    if (!deviceId) return;
    likeArticle({ id, deviceId });
  }

  const handlers = useSwipeable({
    onSwipedLeft: () => onCategoryChange(1),
    onSwipedRight: () => onCategoryChange(-1),
    onSwipedUp: () => goToSlide(1),
    onSwipedDown: () => goToSlide(-1),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  return (
    <div {...handlers} className="relative flex h-full flex-col select-none">
      {currentSlide?.kind === "ad" ? (
        <div key={currentSlide.key} className={`relative flex h-full flex-col overflow-hidden ${reelAnimClass}`}>
          <div className="absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-4 pt-3">
            <CategoryTabs active={category} onChange={onSelectCategory} variant="overlay" />
          </div>
          <AdReelSlide />
        </div>
      ) : (
        <>
          <div className="relative h-[42%] w-full shrink-0 overflow-hidden bg-[#0b1120]">
            <div key={article?.id ?? "empty-image"} className={`absolute inset-0 ${article && !postLoading ? reelAnimClass : ""}`}>
              {article && !postLoading && (
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority
                />
              )}
            </div>

            {postLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              </div>
            )}

            <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/60 to-transparent p-4 pt-3">
              <CategoryTabs active={category} onChange={onSelectCategory} variant="overlay" />
            </div>

            {article && !postLoading && (
              <div className="absolute right-3 bottom-3 flex flex-col items-center gap-4">
                <button
                  onClick={handleLike}
                  className={`flex flex-col items-center gap-1 text-xs font-semibold drop-shadow ${
                    article.liked ? "text-rose-500" : "text-white"
                  }`}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40">
                    <HeartIcon className="h-6 w-6" filled={article.liked} />
                  </span>
                  {article.likes}
                </button>
                <button className="flex flex-col items-center gap-1 text-xs font-semibold text-white drop-shadow">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40">
                    <ShareIcon className="h-5 w-5" />
                  </span>
                  Share
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto bg-[#0b1120] px-5 pt-5 pb-4">
            {!postLoading && !article && (
              <p className="text-slate-500">No articles in this category yet.</p>
            )}
            {!postLoading && article && (
              <div key={article.id} className={reelAnimClass}>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {timeAgo(article.publishedAt)}
                  </span>
                  <span className="rounded-full bg-blue-600 px-3 py-0.5 text-xs font-semibold text-white">
                    {article.tag}
                  </span>
                </div>
                <h1 className="mt-3 text-2xl font-bold leading-tight text-white">{article.title}</h1>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-400">{article.excerpt}</p>
                <p className="mt-3 text-xs text-slate-600">
                  Swipe left / right to change category &middot; swipe up / down for next article
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function MobileFeed() {
  const deviceId = useDeviceId();
  const [category, setCategory] = useState<Category>("top");
  const [adGateDirection, setAdGateDirection] = useState<1 | -1 | null>(null);

  const categorySwipeCountRef = useRef(0);
  const pendingCategoryRef = useRef<Category | null>(null);

  function changeCategory(direction: 1 | -1) {
    const currentIdx = CATEGORIES.findIndex((c) => c.key === category);
    const nextIdx = (currentIdx + direction + CATEGORIES.length) % CATEGORIES.length;
    const nextCategory = CATEGORIES[nextIdx].key;

    categorySwipeCountRef.current += 1;
    if (categorySwipeCountRef.current % CATEGORY_SWIPES_PER_AD === 0) {
      pendingCategoryRef.current = nextCategory;
      setAdGateDirection(direction);
    } else {
      setCategory(nextCategory);
    }
  }

  function dismissAdGate() {
    const next = pendingCategoryRef.current;
    pendingCategoryRef.current = null;
    setAdGateDirection(null);
    if (next) setCategory(next);
  }

  const adGateHandlers = useSwipeable({
    onSwipedLeft: dismissAdGate,
    onSwipedRight: dismissAdGate,
    onSwipedUp: dismissAdGate,
    onSwipedDown: dismissAdGate,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-[#0b1120]">
      <div className="flex-1 overflow-hidden">
        {adGateDirection ? (
          <div
            {...adGateHandlers}
            className={`relative flex h-full flex-col select-none overflow-hidden ${
              adGateDirection === 1 ? "animate-reel-in-right" : "animate-reel-in-left"
            }`}
          >
            <div className="absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-4 pt-3">
              <CategoryTabs active={category} onChange={setCategory} variant="overlay" />
            </div>
            <AdReelSlide />
          </div>
        ) : (
          <CategoryFeed
            category={category}
            deviceId={deviceId}
            onCategoryChange={changeCategory}
            onSelectCategory={setCategory}
          />
        )}
      </div>

      <nav className="flex shrink-0 items-center justify-around border-t border-white/10 bg-black py-3">
        <button className="text-slate-400">
          <SearchIcon />
        </button>
        <button className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-900">
          <HomeIcon />
        </button>
        <button className="text-slate-400">
          <ProfileIcon />
        </button>
      </nav>
    </div>
  );
}
