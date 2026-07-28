import { NextRequest, NextResponse } from "next/server";
import type { QueryFilter } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { Article, ArticleDocument } from "@/models/Article";
import { Like } from "@/models/Like";
import { getRedis } from "@/lib/redis";

const DEFAULT_PAGE_SIZE = 6;
const CACHE_TTL_SECONDS = 20;

interface CachedArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  tag: string;
  publishedAt: Date;
  likes: number;
}

interface CachedPage {
  articles: CachedArticle[];
  hasMore: boolean;
  page: number;
}

function cacheKey(category: string, page: number, pageSize: number) {
  return `articles:${category}:${page}:${pageSize}`;
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") ?? "top";
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const deviceId = searchParams.get("deviceId") ?? "";
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? DEFAULT_PAGE_SIZE)));

    const redis = getRedis();
    const key = cacheKey(category, page, pageSize);

    let cached: CachedPage | null = null;
    if (redis) {
      cached = await redis.get<CachedPage>(key).catch(() => null);
    }

    let basePage: CachedPage;
    if (cached) {
      basePage = cached;
    } else {
      const filter: QueryFilter<ArticleDocument> =
        category === "top" ? {} : { category: category as ArticleDocument["category"] };

      const [articles, total] = await Promise.all([
        Article.find(filter)
          .sort({ publishedAt: -1 })
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .lean(),
        Article.countDocuments(filter),
      ]);

      basePage = {
        articles: articles.map((a) => ({
          id: String(a._id),
          slug: a.slug,
          title: a.title,
          excerpt: a.excerpt,
          image: a.image,
          category: a.category,
          tag: a.tag,
          publishedAt: a.publishedAt,
          likes: a.likes,
        })),
        hasMore: page * pageSize < total,
        page,
      };

      if (redis) {
        await redis.set(key, basePage, { ex: CACHE_TTL_SECONDS }).catch(() => {});
      }
    }

    let likedIds = new Set<string>();
    if (deviceId && basePage.articles.length > 0) {
      const likes = await Like.find({
        deviceId,
        articleId: { $in: basePage.articles.map((a) => a.id) },
      }).lean();
      likedIds = new Set(likes.map((l) => String(l.articleId)));
    }

    return NextResponse.json({
      articles: basePage.articles.map((a) => ({ ...a, liked: likedIds.has(a.id) })),
      hasMore: basePage.hasMore,
      page: basePage.page,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load articles" },
      { status: 500 }
    );
  }
}
