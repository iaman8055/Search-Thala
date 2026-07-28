"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { ArticleSummary } from "@/lib/types";
import { HeartIcon, ShareIcon } from "./icons";

export function ArticleCard({
  article,
  onLike,
  className = "",
  style,
}: {
  article: ArticleSummary;
  onLike: (id: string) => void;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <article
      className={`flex flex-col overflow-hidden rounded-2xl bg-[#141d2f] shadow-lg shadow-black/20 ${className}`}
      style={style}
    >
      <div className="relative h-52 w-full">
        <Image
          src={article.image}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug text-white">{article.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-400">{article.excerpt}</p>
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
          <button
            onClick={() => onLike(article.id)}
            className={`flex items-center gap-1.5 text-sm font-medium transition ${
              article.liked ? "text-rose-500" : "text-slate-400 hover:text-rose-400"
            }`}
          >
            <HeartIcon className="h-4 w-4" filled={article.liked} />
            {article.likes}
          </button>
          <button className="text-slate-400 transition hover:text-white">
            <ShareIcon />
          </button>
        </div>
      </div>
    </article>
  );
}
