import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import PitchPanel from "@/components/PitchPanel";
import { getAllArticles } from "@/lib/articles";
import { formatDate } from "@/lib/format";
import { categories, getCategory } from "@/lib/config";

export default async function HomePage() {
  const all = await getAllArticles();

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

  const lead = all.find((a) => a.featured) ?? all[0];
  const rest = all.filter((a) => a.slug !== lead.slug);
  const latest = rest.slice(0, 5);
  const leadCat = getCategory(lead.category);

  return (
    <div className="space-y-14">
      {/* Bosh maqola va so'nggi xabarlar */}
      <section className="grid gap-8 lg:grid-cols-3">
        <PitchPanel color={leadCat?.color ?? "#1B8A4B"} className="group lg:col-span-2">
          <div className="flex min-h-[340px] flex-col justify-end p-6 sm:min-h-[420px] sm:p-10">
            <span className="mb-4 inline-block w-fit rounded bg-white px-2.5 py-1 text-sm font-semibold text-[#0f1b2d]">
              {leadCat?.name}
            </span>
            <h1 className="text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl">
              <Link
                href={`/yangilik/${lead.slug}`}
                className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-[3px] group-hover:underline-offset-8"
              >
                {lead.title}
              </Link>
            </h1>
            {lead.excerpt && (
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">{lead.excerpt}</p>
            )}
            <p className="mt-4 text-sm text-white/80">{formatDate(lead.date)}</p>
          </div>
        </PitchPanel>

        <aside aria-labelledby="songgi">
          <h2 id="songgi" className="border-b-[3px] border-hl pb-2 text-xl font-extrabold tracking-tight">
            So'nggi xabarlar
          </h2>
          <ol>
            {latest.map((a) => {
              const c = getCategory(a.category);
              return (
                <li key={a.slug} className="relative border-b border-line py-4">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: c?.color }}
                      aria-hidden="true"
                    />
                    <span>{c?.name}</span>
                    <time dateTime={a.date} className="ml-auto">
                      {formatDate(a.date)}
                    </time>
                  </div>
                  <Link
                    href={`/yangilik/${a.slug}`}
                    className="mt-1.5 block text-[1.05rem] font-bold leading-snug after:absolute after:inset-0 hover:underline hover:underline-offset-4"
                  >
                    {a.title}
                  </Link>
                </li>
              );
            })}
          </ol>
        </aside>
      </section>

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
