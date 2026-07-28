import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Article } from "@/models/Article";
import { Like } from "@/models/Like";
import { getRedis } from "@/lib/redis";

async function invalidateCategoryCache(category: string) {
  const redis = getRedis();
  if (!redis) return;
  try {
    const keys = await redis.keys(`articles:${category}:*`);
    if (keys.length > 0) await redis.del(...keys);
  } catch {
    // best-effort cache invalidation; stale cache will still expire via TTL
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const deviceId: string | undefined = body?.deviceId;

    if (!deviceId) {
      return NextResponse.json({ error: "deviceId is required" }, { status: 400 });
    }

    const existing = await Like.findOne({ articleId: id, deviceId });

    let liked: boolean;
    if (existing) {
      await existing.deleteOne();
      liked = false;
    } else {
      await Like.create({ articleId: id, deviceId });
      liked = true;
    }

    const article = await Article.findByIdAndUpdate(
      id,
      { $inc: { likes: liked ? 1 : -1 } },
      { returnDocument: "after" }
    ).lean();

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    await Promise.all([
      invalidateCategoryCache("top"),
      invalidateCategoryCache(article.category),
    ]);

    return NextResponse.json({ liked, likes: article.likes });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to toggle like" },
      { status: 500 }
    );
  }
}
