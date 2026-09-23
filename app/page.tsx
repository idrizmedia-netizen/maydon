import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import GamesWidget from "@/components/GamesWidget";
import PitchPanel from "@/components/PitchPanel";
import { getAllArticles, getArticlesByMedia, getMostViewed } from "@/lib/articles";
import { getGames } from "@/lib/games";
import { formatDate, formatViews } from "@/lib/format";
import { categories, getCategory, siteConfig } from "@/lib/config";

export default async function HomePage() {
  const all = await getAllArticles();
  const games = await getGames().catch(() => []);

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    logo: `${siteConfig.url}/icon.svg`,
  };

  if (all.length === 0) {
    return (
      <div className="rounded border border-line bg-surface p-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Hozircha maqola yo'q</h1>
        <p className="mt-2 text-muted">
          <code>content/articles</code> papkasiga <code>.md</code> fayl qo'shing, yangilik shu yerda paydo bo'ladi.
        </p>
      </div>
    );
  }

  // Tahririyat tanlovi: "asosiy" deb belgilangan maqolalar (yo'q bo'lsa - eng so'nggilari)
  const picks = all.filter((a) => a.featured).slice(0, 5);
  const editorial = picks.length > 0 ? picks : all.slice(0, 5);
  const [lead, ...pickList] = editorial;
  const leadCat = getCategory(lead.category);

  const rest = all.filter((a) => a.slug !== lead.slug);
  const latest = rest.slice(0, 5);

  // Qaynoq yangiliklar: eng ko'p o'qilgan maqolalar (lead'dan tashqari)
  const hot = await getMostViewed(8, lead.slug);

  // Video va Foto bo'limlari uchun so'nggi materiallar
  const [videos, photos] = await Promise.all([getArticlesByMedia("video", 4), getArticlesByMedia("photo", 4)]);

  return (
    <div className="space-y-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      {/* Tahririyat tanlovi */}
      <section aria-labelledby="tahririyat">
        <h1 id="tahririyat" className="mb-4 flex items-center gap-2 border-b-[3px] border-hl pb-2 text-xl font-extrabold tracking-tight">
          Tahririyat tanlovi <span aria-hidden="true">⭐</span>
        </h1>
        <div className="grid gap-8 lg:grid-cols-3">
          <PitchPanel color={leadCat?.color ?? "#1B8A4B"} className="group lg:col-span-2">
            <div className="flex min-h-[340px] flex-col justify-end p-6 sm:min-h-[420px] sm:p-10">
              <span className="mb-4 inline-block w-fit rounded bg-white px-2.5 py-1 text-sm font-semibold text-[#0f1b2d]">
                {leadCat?.name}
              </span>
              <h2 className="text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl">
                <Link
                  href={`/yangilik/${lead.slug}`}
                  className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-[3px] group-hover:underline-offset-8"
                >
                  {lead.title}
                </Link>
              </h2>
              {lead.excerpt && (
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">{lead.excerpt}</p>
              )}
              <p className="mt-4 text-sm text-white/80">{formatDate(lead.date)}</p>
            </div>
          </PitchPanel>

          <aside className="space-y-6">
            {games.length > 0 && <GamesWidget games={games} />}
            {pickList.length > 0 && (
              <div aria-labelledby="tanlov-royxat">
                <h3 id="tanlov-royxat" className="border-b border-line pb-2 text-sm font-semibold uppercase tracking-wide text-muted">
                  Yana tanlangan maqolalar
                </h3>
                <ol>
                  {pickList.map((a) => {
                    const c = getCategory(a.category);
                    return (
                      <li key={a.slug} className="relative border-b border-line py-3">
                        <div className="flex items-center gap-2 text-xs text-muted">
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: c?.color }}
                            aria-hidden="true"
                          />
                          <span>{c?.name}</span>
                          <time dateTime={a.date} className="ml-auto">
                            {formatDate(a.date)}
                          </time>
                          {a.commentCount > 0 && <span>💬 {a.commentCount}</span>}
                        </div>
                        <Link
                          href={`/yangilik/${a.slug}`}
                          className="mt-1 block text-[0.95rem] font-bold leading-snug after:absolute after:inset-0 hover:underline hover:underline-offset-4"
                        >
                          {a.title}
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* Qaynoq yangiliklar */}
      {hot.length > 0 && (
        <section aria-labelledby="qaynoq">
          <div className="mb-4 flex items-end justify-between border-b-[3px] border-hl pb-2">
            <h2 id="qaynoq" className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
              Qaynoq yangiliklar <span aria-hidden="true">🔥</span>
            </h2>
            <Link href="/qidiruv" className="text-sm font-semibold text-accent underline underline-offset-4">
              Barchasi
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {hot.map((a, i) => {
              const c = getCategory(a.category);
              return (
                <article key={a.slug} className="relative flex gap-3 border-b border-line pb-4 sm:border-0 sm:pb-0">
                  <span className="text-2xl font-extrabold text-muted/40">{i + 1}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: c?.color }}
                        aria-hidden="true"
                      />
                      <span>{c?.name}</span>
                    </div>
                    <h3 className="mt-1 text-[0.95rem] font-bold leading-snug">
                      <Link href={`/yangilik/${a.slug}`} className="after:absolute after:inset-0 hover:underline hover:underline-offset-4">
                        {a.title}
                      </Link>
                    </h3>
                    <p className="mt-1.5 flex items-center gap-3 text-xs text-muted">
                      <span>{formatViews(a.views)} ko'rish</span>
                      {a.commentCount > 0 && <span>💬 {a.commentCount}</span>}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* So'nggi xabarlar */}
      <section aria-labelledby="songgi">
        <h2 id="songgi" className="mb-4 border-b-[3px] border-hl pb-2 text-xl font-extrabold tracking-tight">
          So'nggi xabarlar
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </section>

      {/* Video va Foto */}
      {(videos.length > 0 || photos.length > 0) && (
        <section className="grid gap-10 lg:grid-cols-2">
          {videos.length > 0 && (
            <div aria-labelledby="kun-videosi">
              <div className="mb-4 flex items-end justify-between border-b-[3px] border-hl pb-2">
                <h2 id="kun-videosi" className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
                  Kun videosi <span aria-hidden="true">▶</span>
                </h2>
                <Link href="/video" className="text-sm font-semibold text-accent underline underline-offset-4">
                  Barchasi
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {videos.map((a) => (
                  <ArticleCard key={a.slug} article={a} />
                ))}
              </div>
            </div>
          )}
          {photos.length > 0 && (
            <div aria-labelledby="kun-fotosi">
              <div className="mb-4 flex items-end justify-between border-b-[3px] border-hl pb-2">
                <h2 id="kun-fotosi" className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
                  Kun fotosi <span aria-hidden="true">📷</span>
                </h2>
                <Link href="/photo" className="text-sm font-semibold text-accent underline underline-offset-4">
                  Barchasi
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {photos.map((a) => (
                  <ArticleCard key={a.slug} article={a} />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Kategoriyalar bo'yicha */}
      {categories.map((cat) => {
        const items = rest.filter((a) => a.category === cat.slug).slice(0, 3);
        if (items.length === 0) return null;
        return (
          <section key={cat.slug} aria-labelledby={`cat-${cat.slug}`}>
            <div className="mb-4 flex items-end justify-between border-b border-line pb-2">
              <h2 id={`cat-${cat.slug}`} className="flex items-center gap-3 text-2xl font-extrabold tracking-tight">
                <span className="inline-block h-6 w-1.5 rounded-sm" style={{ backgroundColor: cat.color }} aria-hidden="true" />
                {cat.name}
              </h2>
              <Link href={`/kategoriya/${cat.slug}`} className="text-sm font-semibold text-accent underline underline-offset-4">
                Barcha {cat.name.toLowerCase()} maqolalari
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
