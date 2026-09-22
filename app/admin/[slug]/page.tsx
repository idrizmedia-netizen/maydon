import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleForm from "@/components/admin/ArticleForm";
import { getStoredArticle } from "@/lib/articles";
import { todayTashkent } from "@/lib/format";

export const metadata: Metadata = { title: "Maqolani tahrirlash" };
export const dynamic = "force-dynamic";

export default async function EditArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await getStoredArticle(slug);
  if (!a) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight">Maqolani tahrirlash</h1>
      <ArticleForm
        today={todayTashkent()}
        initial={{
          slug: a.slug,
          title: a.title,
          excerpt: a.excerpt,
          content: a.content,
          category: a.category,
          kind: a.kind,
          author: a.author,
          date: a.date,
          tags: a.tags.join(", "),
          image: a.image,
          featured: a.featured,
          draft: a.draft,
          media: a.media ?? "none",
          videoUrl: a.videoUrl,
        }}
      />
    </div>
  );
}
