import type { Metadata } from "next";
import Link from "next/link";
import { categories } from "@/lib/config";
import { getGames } from "@/lib/games";
import { dateTashkent, formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "O'yinlar markazi",
  description: "Bugungi va yaqin kunlardagi sport o'yinlari, natijalar va jadval.",
  alternates: { canonical: "/oyinlar" },
};
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  rejalashtirilgan: "hali boshlanmadi",
  jonli: "jonli",
  tugadi: "tugadi",
};

const TABS = [
  { offset: -1, label: "Kecha" },
  { offset: 0, label: "Bugun" },
  { offset: 1, label: "Ertaga" },
];

type Props = { searchParams: Promise<{ kun?: string }> };

export default async function GameCenterPage({ searchParams }: Props) {
  const sp = await searchParams;
  const offset = TABS.some((t) => String(t.offset) === sp.kun) ? Number(sp.kun) : 0;
  const date = dateTashkent(offset);
  const games = await getGames(date);

  return (
    <div>
      <header className="mb-8 border-b border-line pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">O'yinlar markazi</h1>
        <p className="mt-2 text-muted">{formatDate(date)}</p>
      </header>

      <div className="mb-8 flex gap-2 border-b border-line">
        {TABS.map((t) => {
          const active = t.offset === offset;
          const href = t.offset === 0 ? "/oyinlar" : `/oyinlar?kun=${t.offset}`;
          return (
            <Link
              key={t.offset}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`border-b-[3px] px-4 py-2.5 text-sm font-semibold ${
                active ? "border-hl text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {games.length === 0 ? (
        <p className="rounded border border-line bg-surface p-6 text-muted">
          Bu kun uchun o'yinlar hali qo'shilmagan.
        </p>
      ) : (
        <div className="space-y-8">
          {categories.map((cat) => {
            const catGames = games.filter((g) => g.category === cat.slug);
            if (catGames.length === 0) return null;
            return (
              <section key={cat.slug} aria-labelledby={`oyin-${cat.slug}`}>
                <h2 id={`oyin-${cat.slug}`} className="mb-3 flex items-center gap-3 text-xl font-extrabold tracking-tight">
                  <span className="inline-block h-5 w-1.5 rounded-sm" style={{ backgroundColor: cat.color }} aria-hidden="true" />
                  {cat.name}
                </h2>
                <div className="overflow-hidden rounded border border-line bg-surface">
                  {catGames.map((g, i) => {
                    const hasScore = g.score1 !== null && g.score2 !== null;
                    return (
                      <div
                        key={g.id}
                        className={`flex items-center gap-4 px-4 py-3.5 ${i > 0 ? "border-t border-line" : ""}`}
                      >
                        <div className="w-20 shrink-0 text-sm text-muted">
                          {g.status === "jonli" ? (
                            <span className="font-bold text-[#C93B3B]">● jonli</span>
                          ) : (
                            <span>{g.status === "tugadi" ? "Tugadi" : g.time || STATUS_LABEL[g.status]}</span>
                          )}
                        </div>
                        <div className="flex flex-1 items-center justify-between gap-3 text-sm font-semibold sm:text-base">
                          <span className="text-right sm:text-left">{g.team1}</span>
                          <span className="shrink-0 tabular-nums text-muted">
                            {hasScore ? `${g.score1} : ${g.score2}` : g.time || "—"}
                          </span>
                          <span>{g.team2}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
