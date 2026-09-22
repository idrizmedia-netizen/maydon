import Link from "next/link";
import { getCategory } from "@/lib/config";
import type { Game } from "@/lib/games";

const STATUS_LABEL: Record<string, string> = {
  rejalashtirilgan: "hali boshlanmadi",
  jonli: "jonli",
  tugadi: "tugadi",
};

export default function GamesWidget({ games }: { games: Game[] }) {
  if (games.length === 0) return null;

  return (
    <aside aria-labelledby="oyinlar" className="rounded border border-line bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="oyinlar" className="text-lg font-extrabold tracking-tight">
          Bugungi o'yinlar
        </h2>
        <Link href="/oyinlar" className="text-sm font-semibold text-accent underline underline-offset-4">
          Barchasi
        </Link>
      </div>
      <ul className="space-y-3">
        {games.map((g) => {
          const c = getCategory(g.category);
          const hasScore = g.score1 !== null && g.score2 !== null;
          return (
            <li key={g.id} className="border-b border-line pb-3 last:border-0 last:pb-0">
              <div className="mb-1 flex items-center gap-2 text-xs text-muted">
                <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: c?.color }} aria-hidden="true" />
                <span>{c?.name}</span>
                {g.status === "jonli" && <span className="ml-auto font-bold text-[#C93B3B]">● jonli</span>}
                {g.status !== "jonli" && (
                  <span className="ml-auto">{g.status === "tugadi" ? "Tugadi" : g.time || STATUS_LABEL[g.status]}</span>
                )}
              </div>
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>{g.team1}</span>
                <span className="tabular-nums">{hasScore ? `${g.score1} : ${g.score2}` : g.time || "—"}</span>
                <span className="text-right">{g.team2}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
