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

      <div className="space-y-3">
        {games.length === 0 && <p className="text-muted">Bugun uchun hali o'yin qo'shilmagan.</p>}
        {games.map((g) => (
          <form
            key={g.id}
            action={updateGameAction}
            className="grid gap-2 rounded border border-line bg-surface p-4 sm:grid-cols-[1fr_1fr_auto_auto_auto_auto_auto]"
          >
            <input type="hidden" name="id" value={g.id} />
            <select name="category" defaultValue={g.category} className="rounded border border-line bg-bg px-2 py-1.5 text-sm">
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <input name="team1" defaultValue={g.team1} placeholder="1-jamoa" className="rounded border border-line bg-bg px-2 py-1.5 text-sm" />
            <input
              name="score1"
              type="number"
              defaultValue={g.score1 ?? ""}
              placeholder="-"
              className="w-16 rounded border border-line bg-bg px-2 py-1.5 text-sm"
            />
            <span className="self-center text-center text-muted">—</span>
            <input
              name="score2"
              type="number"
              defaultValue={g.score2 ?? ""}
              placeholder="-"
              className="w-16 rounded border border-line bg-bg px-2 py-1.5 text-sm"
            />
            <input name="team2" defaultValue={g.team2} placeholder="2-jamoa" className="rounded border border-line bg-bg px-2 py-1.5 text-sm" />
            <input name="time" defaultValue={g.time} placeholder="18:00" className="w-20 rounded border border-line bg-bg px-2 py-1.5 text-sm" />
            <select name="status" defaultValue={g.status} className="rounded border border-line bg-bg px-2 py-1.5 text-sm">
              {Object.entries(STATUS_LABEL).map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </select>
            <div className="flex gap-2 sm:col-span-full sm:justify-end">
              <button type="submit" className="rounded bg-ink px-3 py-1.5 text-sm font-bold text-white">
                Saqlash
              </button>
              <button
                type="submit"
                formAction={deleteGameAction}
                className="rounded border border-[#C93B3B] px-3 py-1.5 text-sm font-bold text-[#C93B3B]"
              >
                O'chirish
              </button>
            </div>
          </form>
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-lg font-bold">Yangi o'yin qo'shish</h2>
      <form action={addGameAction} className="grid gap-2 rounded border border-line bg-surface p-4 sm:grid-cols-3">
        <select name="category" defaultValue={categories[0]?.slug} className="rounded border border-line bg-bg px-2 py-1.5 text-sm">
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <input name="team1" placeholder="1-jamoa" required className="rounded border border-line bg-bg px-2 py-1.5 text-sm" />
        <input name="team2" placeholder="2-jamoa" required className="rounded border border-line bg-bg px-2 py-1.5 text-sm" />
        <input name="time" placeholder="18:00" className="rounded border border-line bg-bg px-2 py-1.5 text-sm" />
        <select name="status" defaultValue="rejalashtirilgan" className="rounded border border-line bg-bg px-2 py-1.5 text-sm">
          {Object.entries(STATUS_LABEL).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded bg-ink px-3 py-1.5 text-sm font-bold text-white">
          Qo'shish
        </button>
      </form>
    </div>
  );
}
