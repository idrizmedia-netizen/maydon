import type { Metadata } from "next";
import ArticleForm from "@/components/admin/ArticleForm";
import { getCategory } from "@/lib/config";
import { todayTashkent } from "@/lib/format";

export const metadata: Metadata = { title: "Yangi maqola" };
export const dynamic = "force-dynamic";

export default async function NewArticlePage({
  searchParams,
}: {
  searchParams: Promise<{ kategoriya?: string }>;
}) {
  const sp = await searchParams;
  const category = getCategory(sp.kategoriya ?? "")?.slug;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight">Yangi maqola</h1>
      <ArticleForm initial={{ category }} today={todayTashkent()} />
    </div>
  );
}
