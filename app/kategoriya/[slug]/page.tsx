import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleCard from "@/components/ArticleCard";
import { getArticlesByCategory } from "@/lib/articles";
import { categories, getCategory } from "@/lib/config";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) return {};
  return {
    title: `${cat.name} yangiliklari`,
    description: cat.description,
    alternates: { canonical: `/kategoriya/${cat.slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) notFound();

  const items = await getArticlesByCategory(cat.slug);

  return (
    <div>
      <header className="mb-8 border-b border-line pb-6">
        <div className="flex items-center gap-3">
          <span className="inline-block h-9 w-2 rounded-sm" style={{ backgroundColor: cat.color }} aria-hidden="true" />
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{cat.name}</h1>
        </div>
        <p className="mt-3 max-w-2xl text-muted">{cat.description}</p>
      </header>

      {items.length === 0 ? (
        <p className="rounded border border-line bg-surface p-6 text-muted">
          Bu kategoriyada hali maqola yo'q. <code>content/articles</code> papkasiga{" "}
          <code>category: {cat.slug}</code> bilan yangi fayl qo'shing.
        </p>
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
