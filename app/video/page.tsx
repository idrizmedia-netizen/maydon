import type { Metadata } from "next";
import ArticleCard from "@/components/ArticleCard";
import { getArticlesByMedia } from "@/lib/articles";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Video",
  description: `${siteConfig.name} saytidagi sport videolari: gollar, sharhlar va qiziqarli lavhalar.`,
  alternates: { canonical: "/video" },
  openGraph: {
    type: "website",
    title: `Video | ${siteConfig.name}`,
    description: `${siteConfig.name} saytidagi sport videolari.`,
    url: "/video",
  },
};

export default async function VideoPage() {
  const items = await getArticlesByMedia("video");

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
        Video <span aria-hidden="true">▶</span>
      </h1>
      {items.length === 0 ? (
        <p className="text-muted">Hozircha video yo'q.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
