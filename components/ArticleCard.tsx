import Link from "next/link";
import type { ArticleMeta } from "@/lib/articles";
import { formatDate } from "@/lib/format";
import { getCategory } from "@/lib/config";

type CardArticle = Pick<ArticleMeta, "slug" | "title" | "excerpt" | "category" | "date"> & {
  image?: string;
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
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.image} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover" />
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2 text-sm text-muted">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
          <span>{cat?.name}</span>
          <time dateTime={article.date} className="ml-auto">
            {formatDate(article.date)}
          </time>
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
      </div>
    </article>
  );
}
