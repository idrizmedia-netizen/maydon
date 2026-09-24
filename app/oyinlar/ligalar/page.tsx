import type { Metadata } from "next";
import Link from "next/link";
import { categories } from "@/lib/config";
import { getGames } from "@/lib/games";
import { dateTashkent, dayDiff, formatDate, shiftDate, todayTashkent } from "@/lib/format";
import { getTeamLogos } from "@/lib/team-logo";
import { GAME_CENTER_ITEMS } from "@/lib/sports-api";
import GameDatePicker from "@/components/GameDatePicker";

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

// `kun` parametri ikki xil bo'lishi mumkin: tab offset ("-1","0","1") yoki
// kalendardan tanlangan aniq sana ("YYYY-MM-DD").
function resolveDate(kun: string | undefined): string {
  if (kun && /^\d{4}-\d{2}-\d{2}$/.test(kun)) return kun;
  const offset = TABS.some((t) => String(t.offset) === kun) ? Number(kun) : 0;
  return dateTashkent(offset);
}

type Props = { searchParams: Promise<{ kun?: string; liga?: string }> };

export default async function PublicGameCenterPage({ searchParams }: Props) {
  const sp = await searchParams;
  const date = resolveDate(sp.kun);
  const activeOffset = dayDiff(todayTashkent(), date); // tablardan biriga mos kelsa, o'shani belgilaydi
  const isCustomDate = !TABS.some((t) => t.offset === activeOffset);
  const prevDate = shiftDate(date, -1);
  const nextDate = shiftDate(date, 1);

  const allGames = await getGames(date);
  const games = sp.liga ? allGames.filter((g) => g.league === sp.liga || g.category === sp.liga) : allGames;
  const logos = await getTeamLogos(games.flatMap((g) => [g.team1, g.team2])).catch(() => ({} as Record<string, string | null>));

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <div>
        <header className="mb-6 border-b border-line pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">O'yinlar markazi</h1>
          <p className="mt-2 text-muted">{formatDate(date)}</p>
        </header>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 border-b border-line">
            {TABS.map((t) => {
              const active = t.offset === activeOffset;
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
            {isCustomDate && (
              <span className="border-b-[3px] border-hl px-4 py-2.5 text-sm font-semibold text-ink">
                {formatDate(date)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/oyinlar?kun=${prevDate}`}
              aria-label="Oldingi kun"
              className="rounded border border-line bg-bg px-2.5 py-1.5 text-sm font-bold hover:bg-line"
            >
              ‹
            </Link>
            <GameDatePicker date={date} basePath="/oyinlar" />
            <Link
              href={`/oyinlar?kun=${nextDate}`}
              aria-label="Keyingi kun"
              className="rounded border border-line bg-bg px-2.5 py-1.5 text-sm font-bold hover:bg-line"
            >
              ›
            </Link>
          </div>
        </div>

        {sp.liga && (
          <div className="mb-4 flex items-center gap-2 text-sm">
            <span className="text-muted">Filtr:</span>
            <span className="rounded-full bg-bg px-3 py-1 font-semibold">{sp.liga}</span>
            <Link href={`/oyinlar?kun=${sp.kun ?? "0"}`} className="text-muted underline hover:text-ink">
              tozalash
            </Link>
          </div>
        )}

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
              const groups: { league: string | null; items: typeof catGames }[] = catGames.some((g) => g.league)
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
                    <details key={group.league ?? "all"} open className="mb-4 overflow-hidden rounded border border-line bg-surface last:mb-0">
                      {group.league && (
                        <summary className="flex cursor-pointer list-none items-center justify-between border-b border-line bg-bg px-4 py-2 text-xs font-bold uppercase tracking-wide text-muted [&::-webkit-details-marker]:hidden">
                          <span>{group.league}</span>
                          <span className="rounded-full bg-line px-2 py-0.5 text-[11px] font-bold normal-case tracking-normal text-ink">
                            {group.items.length}
                          </span>
                        </summary>
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
                    </details>
                  ))}
                </section>
              );
            })}
          </div>
        )}
      </div>

      <aside className="lg:sticky lg:top-4 lg:self-start">
        <div className="rounded border border-line bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-wide">Mashhur musobaqalar</h2>
            {sp.liga && (
              <Link href={`/oyinlar?kun=${sp.kun ?? "0"}`} className="text-xs font-semibold text-muted underline hover:text-ink">
                Barcha
              </Link>
            )}
          </div>
          <ul className="space-y-1">
            {GAME_CENTER_ITEMS.map((item) => {
              const active = sp.liga === item.filter;
              return (
                <li key={item.filter}>
                  <Link
                    href={`/oyinlar?kun=${sp.kun ?? "0"}&liga=${encodeURIComponent(item.filter)}`}
                    className={`flex items-center gap-2.5 rounded px-2.5 py-2 text-sm font-semibold ${
                      active ? "bg-bg text-ink" : "text-muted hover:bg-bg hover:text-ink"
                    }`}
                  >
                    <span aria-hidden="true">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href="/oyinlar/ligalar"
            className="mt-3 flex items-center justify-center gap-1 rounded border border-line py-2 text-sm font-semibold text-muted hover:bg-bg hover:text-ink"
          >
            Barcha ligalar →
          </Link>
        </div>
      </aside>
    </div>
  );
}
