import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/articles";
import { categories, siteConfig } from "@/lib/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const articles = await getAllArticles();

  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/oyinlar`, changeFrequency: "hourly" as const, priority: 0.8 },
    { url: `${base}/video`, changeFrequency: "daily" as const, priority: 0.6 },
    { url: `${base}/photo`, changeFrequency: "daily" as const, priority: 0.6 },
    ...categories.map((c) => ({
      url: `${base}/kategoriya/${c.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...articles.map((a) => ({
      url: `${base}/yangilik/${a.slug}`,
      lastModified: new Date(a.date),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
