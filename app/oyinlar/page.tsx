import type { Metadata } from "next";
import Link from "next/link";
import { getGames, type Game } from "@/lib/games";
import { todayTashkent } from "@/lib/format";
import { GAME_CENTER_ITEMS } from "@/lib/sports-api";

export const metadata: Metadata = {
  title: "Ligalar",
  description: "Maydon qamrab oladigan barcha musobaqalar ro'yxati.",
  alternates: { canonical: "/oyinlar/ligalar" },
};
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  rejalashtirilgan: "hali boshlanmadi",
  jonli: "jonli",
  tugadi: "tugadi",
};

export default async function LeaguesPage() {
  const todayGames = await getGames(todayTashkent());

  const rows = GAME_CENTER_ITEMS.map((item) => ({
    ...item,
    games: todayGames.filter((g) => g.league === item.filter || g.category === item.filter),
  }));

  return (
    <div>
      <header className="mb-6 border-b border-line pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Ligalar</h1>
        <p className="mt-2 text-muted">
          Maydon qamrab oladigan barcha musobaqalar. Har birini bosib, bugungi o'yinlarni ko'ring.
        </p>
      </header>

      <div className="mb-6">
        <Link href="/oyinlar" className="text-sm font-semibold text-muted underline hover:text-ink">
          ← O'yinlar markaziga qaytish
        </Link>
      </div>

      <div className="overflow-hidden rounded border border-line bg-surface">
        {rows.map((row, i) => (
          <details key={row.filter} className={`group ${i > 0 ? "border-t border-line" : ""}`}>
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-4 hover:bg-bg [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-3 text-base font-semibold">
                <span className="text-xl" aria-hidden="true">
                  {row.icon}
                </span>
                {row.label}
              </span>
              <span className="flex items-center gap-3">
                {row.games.length > 0 && (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-muted">
                    <span className="h-2 w-2 rounded-full bg-[#C93B3B]" aria-hidden="true" />
                    {row.games.length}
                  </span>
                )}
                <span className="text-muted transition-transform group-open:rotate-180" aria-hidden="true">
                  ⌄
                </span>
              </span>
            </summary>

            <div className="border-t border-line bg-bg">
              {row.games.length === 0 ? (
                <p className="px-4 py-3.5 text-sm text-muted">Bugun bu bo'yicha o'yin qo'shilmagan.</p>
              ) : (
                row.games.map((g: Game, j: number) => {
                  const hasScore = g.score1 !== null && g.score2 !== null;
                  return (
                    <div
                      key={g.id}
                      className={`flex items-center gap-4 px-4 py-3 text-sm ${j > 0 ? "border-t border-line" : ""}`}
                    >
                      <span className="w-16 shrink-0 text-muted">
                        {g.status === "jonli" ? (
                          <span className="font-bold text-[#C93B3B]">● jonli</span>
                        ) : (
                          g.status === "tugadi" ? "Tugadi" : g.time || STATUS_LABEL[g.status]
                        )}
                      </span>
                      <span className="flex-1 truncate font-semibold">
                        {g.team1} — {g.team2}
                      </span>
                      <span className="shrink-0 tabular-nums text-muted">
                        {hasScore ? `${g.score1} : ${g.score2}` : g.time || "—"}
                      </span>
                    </div>
                  );
                })
              )}
              <Link
                href={`/oyinlar?liga=${encodeURIComponent(row.filter)}`}
                className="block px-4 py-3 text-sm font-semibold text-muted underline hover:text-ink"
              >
                O'yinlar markazida ko'rish →
              </Link>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
