import type { Metadata } from "next";
import Link from "next/link";
import { categories } from "@/lib/config";
import { getGames } from "@/lib/games";
import { dateTashkent, formatDate } from "@/lib/format";
import { getTeamLogos } from "@/lib/team-logo";

function TeamLogo({ src }: { src: string | null }) {
  if (!src) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" width={22} height={22} className="inline-block shrink-0 rounded-full object-contain" />;
}

export const metadata: Metadata = {
  title: "O'yinlar markazi",
  description: "Bugungi va yaqin kunlardagi sport o'yinlari, natijalar va jadval.",
  alternates: { canonical: "/oyinlar" },
  openGraph: {
    type: "website",
    title: "O'yinlar markazi",
    description: "Bugungi va yaqin kunlardagi sport o'yinlari, natijalar va jadval.",
    url: "/oyinlar",
  },
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

export default async function PublicGameCenterPage({ searchParams }: Props) {
  const sp = await searchParams;
  const offset = TABS.some((t) => String(t.offset) === sp.kun) ? Number(sp.kun) : 0;
  const date = dateTashkent(offset);
  const games = await getGames(date);
  const logos = await getTeamLogos(games.flatMap((g) => [g.team1, g.team2])).catch(() => ({} as Record<string, string | null>));

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

            // Futbolda bir nechta turnir bo'lishi mumkin - ular ostida kichik sarlavha bilan guruhlaymiz.
            const groups: { league: string | null; items: typeof catGames }[] =
              cat.slug === "futbol" && catGames.some((g) => g.league)
                ? Array.from(new Set(catGames.map((g) => g.league ?? "Boshqa"))).map((league) => ({
                    league,
                    items: catGames.filter((g) => (g.league ?? "Boshqa") === league),
                  }))
                : [{ league: null, items: catGames }];

            return (
              <section key={cat.slug} aria-labelledby={`oyin-${cat.slug}`}>
                <h2 id={`oyin-${cat.slug}`} className="mb-3 flex items-center gap-3 text-xl font-extrabold tracking-tight">
                  <span className="inline-block h-5 w-1.5 rounded-sm" style={{ backgroundColor: cat.color }} aria-hidden="true" />
                  {cat.name}
                </h2>
                {groups.map((group) => (
                <div key={group.league ?? "all"} className="mb-4 overflow-hidden rounded border border-line bg-surface last:mb-0">
                  {group.league && (
                    <div className="border-b border-line bg-bg px-4 py-2 text-xs font-bold uppercase tracking-wide text-muted">
                      {group.league}
                    </div>
                  )}
                  {group.items.map((g, i) => {
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
                          <span className="flex items-center justify-end gap-2 text-right sm:justify-start sm:text-left">
                            <TeamLogo src={logos[g.team1] ?? null} />
                            {g.team1}
                          </span>
                          <span className="shrink-0 tabular-nums text-muted">
                            {hasScore ? `${g.score1} : ${g.score2}` : g.time || "—"}
                          </span>
                          <span className="flex items-center gap-2">
                            {g.team2}
                            <TeamLogo src={logos[g.team2] ?? null} />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                ))}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
