import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/articles";
import { categories, siteConfig } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const articles = getAllArticles();

  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
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
