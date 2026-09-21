import type { Metadata } from "next";
import SearchClient from "@/components/SearchClient";
import { getAllArticles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Qidiruv",
  description: "Sport maqolalari bo'yicha qidiruv.",
  robots: { index: false },
};

export default async function SearchPage() {
  const items = (await getAllArticles()).map((a) => ({
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    category: a.category,
    date: a.date,
    tags: a.tags,
  }));

  return (
    <div>
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight sm:text-4xl">Qidiruv</h1>
      <SearchClient items={items} />
    </div>
  );
}
