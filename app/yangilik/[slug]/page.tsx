import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleCard from "@/components/ArticleCard";
import Comments from "@/components/Comments";
import PitchPanel from "@/components/PitchPanel";
import { getAllArticles, getArticle, getRelated, incrementViews } from "@/lib/articles";
import { formatDate, formatViews } from "@/lib/format";
import { getCategory, siteConfig } from "@/lib/config";
import { toEmbedUrl } from "@/lib/video";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getAllArticles()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  // Muqova rasmi bo'lsa - o'shani, bo'lmasa avtomatik generatsiya qilingan OG rasmni ishlatamiz
  const images = [article.image || `/yangilik/${article.slug}/opengraph-image`];
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/yangilik/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      publishedTime: article.date,
      authors: [article.author],
      url: `/yangilik/${article.slug}`,
      images,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  // O'quvchi sonini oshiramiz (sahifa ko'rsatilishini kutmaydi, xato bo'lsa jim o'tadi)
  incrementViews(slug).catch(() => {});

  const cat = getCategory(article.category);
  const related = await getRelated(article, 3);
  const url = `${siteConfig.url}/yangilik/${article.slug}`;
  const enc = encodeURIComponent;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    author: { "@type": "Person", name: article.author },
    publisher: { "@type": "Organization", name: siteConfig.name },
    mainEntityOfPage: url,
    ...(article.image ? { image: [article.image] } : {}),
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <PitchPanel color={cat?.color ?? "#1B8A4B"}>
        <div className="flex min-h-[260px] flex-col justify-end p-6 sm:min-h-[320px] sm:p-10">
          <Link
            href={`/kategoriya/${article.category}`}
            className="mb-4 inline-block w-fit rounded bg-white px-2.5 py-1 text-sm font-semibold text-[#0f1b2d] hover:underline"
          >
            {cat?.name}
          </Link>
          <h1 className="max-w-3xl text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl">
            {article.title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/85">
            <span>{article.kind === "yangilik" ? "Yangilik" : "Maqola"}</span>
            {article.media === "video" && <span>▶ Video</span>}
            {article.media === "photo" && <span>📷 Foto</span>}
            <span>{article.author}</span>
            <time dateTime={article.date}>{formatDate(article.date)}</time>
            <span>{article.readingMinutes} daqiqalik o'qish</span>
            <span>{formatViews(article.views)} ko'rishlar</span>
          </div>
        </div>
      </PitchPanel>

      <div className="mt-10">
        {article.excerpt && (
          <p className="max-w-[68ch] font-text text-xl leading-relaxed text-muted">{article.excerpt}</p>
        )}

        {article.media === "video" && article.videoUrl && toEmbedUrl(article.videoUrl) && (
          <div className="mt-8 aspect-video w-full max-w-3xl overflow-hidden rounded bg-black">
            <iframe
              src={toEmbedUrl(article.videoUrl)!}
              title={article.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {article.image && article.media !== "video" && (
          <div className="relative mt-8 aspect-[16/9] w-full max-w-3xl overflow-hidden rounded">
            <Image
              src={article.image}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 768px, 100vw"
              className="object-cover"
            />
          </div>
        )}

        <div className="article-body mt-8" dangerouslySetInnerHTML={{ __html: article.html }} />

        {article.tags.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-2">
            {article.tags.map((t) => (
              <li key={t} className="rounded border border-line bg-surface px-2.5 py-1 text-sm text-muted">
                {t}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 flex max-w-[68ch] flex-wrap items-center gap-x-5 gap-y-2 border-y border-line py-4 text-sm font-semibold">
          <span className="text-muted">Ulashish:</span>
          <a className="underline underline-offset-4" target="_blank" rel="noopener noreferrer"
             href={`https://t.me/share/url?url=${enc(url)}&text=${enc(article.title)}`}>Telegram</a>
          <a className="underline underline-offset-4" target="_blank" rel="noopener noreferrer"
             href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`}>Facebook</a>
          <a className="underline underline-offset-4" target="_blank" rel="noopener noreferrer"
             href={`https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(article.title)}`}>X</a>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14" aria-labelledby="oxshash">
          <h2 id="oxshash" className="mb-4 border-b-[3px] border-hl pb-2 text-2xl font-extrabold tracking-tight">
            Yana o'qing
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </section>
      )}

      <Comments slug={article.slug} />
    </article>
  );
}
