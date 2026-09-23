import Image from "next/image";
import Link from "next/link";
import type { ArticleMeta } from "@/lib/articles";
import { formatDate, formatViews } from "@/lib/format";
import { getCategory } from "@/lib/config";

type CardArticle = Pick<ArticleMeta, "slug" | "title" | "excerpt" | "category" | "date"> & {
  image?: string;
  views?: number;
  commentCount?: number;
  media?: ArticleMeta["media"];
};

export default function ArticleCard({ article }: { article: CardArticle }) {
  const cat = getCategory(article.category);
  const color = cat?.color ?? "#0E7C86";

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded border border-line bg-surface"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      {article.image && (
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image
            src={article.image}
            alt=""
            fill
            loading="lazy"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
          {article.media === "video" && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/25">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-xl">▶</span>
            </span>
          )}
          {article.media === "photo" && (
            <span className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-1 text-xs font-semibold text-white">
              📷 Foto
            </span>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2 text-sm text-muted">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
          <span>{cat?.name}</span>
          <time dateTime={article.date} className="ml-auto">
            {formatDate(article.date)}
          </time>
          {typeof article.commentCount === "number" && article.commentCount > 0 && (
            <span className="flex items-center gap-1 text-xs">
              💬 {article.commentCount}
            </span>
          )}
        </div>
        <h3 className="mt-2 text-lg font-extrabold leading-snug tracking-tight">
          <Link
            href={`/yangilik/${article.slug}`}
            className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4"
          >
            {article.title}
          </Link>
        </h3>
        {article.excerpt && (
          <p className="mt-2 line-clamp-2 text-[0.95rem] leading-relaxed text-muted">{article.excerpt}</p>
        )}
        {typeof article.views === "number" && article.views > 0 && (
          <p className="mt-2 text-xs text-muted">{formatViews(article.views)} ko'rish</p>
        )}
      </div>
    </article>
  );
}
