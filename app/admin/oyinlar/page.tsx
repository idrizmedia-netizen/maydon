import type { Metadata } from "next";
import { categories } from "@/lib/config";
import { getGames } from "@/lib/games";
import { todayTashkent } from "@/lib/format";
import { addGameAction, deleteGameAction, updateGameAction } from "./actions";

export const metadata: Metadata = { title: "Bugungi o'yinlar" };
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  rejalashtirilgan: "Boshlanmagan",
  jonli: "Jonli",
  tugadi: "Tugadi",
};

export default async function GamesAdminPage() {
  const games = await getGames();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">Bugungi o'yinlar</h1>
        <span className="text-sm text-muted">{todayTashkent()}</span>
      </div>

      <div className="space-y-6">
        {categories.map((cat) => {
          const catGames = games.filter((g) => g.category === cat.slug);
          return (
            <section
              key={cat.slug}
              className="overflow-hidden rounded-lg border border-line bg-surface"
              style={{ borderLeft: `4px solid ${cat.color}` }}
            >
              <div className="flex items-center gap-2 border-b border-line bg-bg/50 px-4 py-3">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} aria-hidden="true" />
                <h2 className="font-bold">{cat.name}</h2>
                <span className="ml-auto text-xs text-muted">{catGames.length} ta o'yin</span>
              </div>

              <div className="space-y-3 p-4">
                {catGames.map((g) => (
                  <form
                    key={g.id}
                    action={updateGameAction}
                    className="grid gap-2 rounded border border-line bg-bg p-3 sm:grid-cols-[1fr_auto_auto_auto_1fr_auto_auto_auto]"
                  >
                    <input type="hidden" name="id" value={g.id} />
                    <input type="hidden" name="category" value={cat.slug} />
                    <input name="team1" defaultValue={g.team1} placeholder="1-jamoa" className="rounded border border-line bg-surface px-2 py-1.5 text-sm" />
                    <input
                      name="score1"
                      type="number"
                      defaultValue={g.score1 ?? ""}
                      placeholder="-"
                      className="w-14 rounded border border-line bg-surface px-2 py-1.5 text-center text-sm"
                    />
                    <span className="self-center text-center text-muted">—</span>
                    <input
                      name="score2"
                      type="number"
                      defaultValue={g.score2 ?? ""}
                      placeholder="-"
                      className="w-14 rounded border border-line bg-surface px-2 py-1.5 text-center text-sm"
                    />
                    <input name="team2" defaultValue={g.team2} placeholder="2-jamoa" className="rounded border border-line bg-surface px-2 py-1.5 text-sm" />
                    <input name="time" defaultValue={g.time} placeholder="18:00" className="w-20 rounded border border-line bg-surface px-2 py-1.5 text-sm" />
                    <select name="status" defaultValue={g.status} className="rounded border border-line bg-surface px-2 py-1.5 text-sm">
                      {Object.entries(STATUS_LABEL).map(([v, label]) => (
                        <option key={v} value={v}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2 sm:col-span-full sm:justify-end">
                      <button type="submit" className="rounded bg-ink px-3 py-1.5 text-xs font-bold text-white">
                        Saqlash
                      </button>
                      <button
                        type="submit"
                        formAction={deleteGameAction}
                        className="rounded border border-[#C93B3B] px-3 py-1.5 text-xs font-bold text-[#C93B3B]"
                      >
                        O'chirish
                      </button>
                    </div>
                  </form>
                ))}
                {catGames.length === 0 && <p className="text-sm text-muted">Bu bo'limda hali o'yin yo'q.</p>}

                <form action={addGameAction} className="grid gap-2 border-t border-line pt-3 sm:grid-cols-[1fr_1fr_auto_auto]">
                  <input type="hidden" name="category" value={cat.slug} />
                  <input name="team1" placeholder="1-jamoa" required className="rounded border border-line bg-bg px-2 py-1.5 text-sm" />
                  <input name="team2" placeholder="2-jamoa" required className="rounded border border-line bg-bg px-2 py-1.5 text-sm" />
                  <input name="time" placeholder="18:00" className="w-24 rounded border border-line bg-bg px-2 py-1.5 text-sm" />
                  <button type="submit" className="rounded px-3 py-1.5 text-sm font-bold text-white" style={{ backgroundColor: cat.color }}>
                    + {cat.name}ga qo'shish
                  </button>
                  <input type="hidden" name="status" value="rejalashtirilgan" />
                </form>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
