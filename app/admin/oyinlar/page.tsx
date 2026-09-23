import type { Metadata } from "next";
import Link from "next/link";
import { categories } from "@/lib/config";
import { getGames } from "@/lib/games";
import { dateTashkent, formatDate } from "@/lib/format";
import { addGameAction, deleteGameAction, updateGameAction } from "./actions";

const inputCls = "w-full rounded border border-line bg-surface px-2.5 py-2 text-sm";
const selectCls = inputCls;
const labelCls = "mb-1 block text-xs font-semibold text-muted";

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

      <section className="mb-10 rounded border border-line bg-surface p-4">
        <h2 className="mb-3 text-lg font-extrabold tracking-tight">
          Yangi o'yin qo'shish <span className="font-normal text-muted">({formatDate(date)})</span>
        </h2>
        <form action={addGameAction} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7 lg:items-end">
          <input type="hidden" name="date" value={date} />
          <div className="lg:col-span-1">
            <label className={labelCls}>Sport turi</label>
            <select name="category" className={selectCls} defaultValue={categories[0]?.slug}>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-1">
            <label className={labelCls}>1-jamoa</label>
            <input name="team1" required className={inputCls} placeholder="Masalan: Pakhtakor" />
          </div>
          <div className="lg:col-span-1">
            <label className={labelCls}>2-jamoa</label>
            <input name="team2" required className={inputCls} placeholder="Masalan: Nasaf" />
          </div>
          <div>
            <label className={labelCls}>Vaqti</label>
            <input name="time" className={inputCls} placeholder="18:00" />
          </div>
          <div>
            <label className={labelCls}>Holati</label>
            <select name="status" className={selectCls} defaultValue="rejalashtirilgan">
              <option value="rejalashtirilgan">Hali boshlanmadi</option>
              <option value="jonli">Jonli</option>
              <option value="tugadi">Tugadi</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Hisob 1</label>
            <input name="score1" type="number" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Hisob 2</label>
            <input name="score2" type="number" className={inputCls} />
          </div>
          <button
            type="submit"
            className="col-span-2 rounded bg-hl px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 sm:col-span-3 lg:col-span-7 lg:w-fit"
          >
            Qo'shish
          </button>
        </form>
      </section>

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
                  {catGames.map((g, i) => (
                    <form
                      key={g.id}
                      action={updateGameAction}
                      className={`flex flex-wrap items-end gap-2 px-4 py-3.5 ${i > 0 ? "border-t border-line" : ""}`}
                    >
                      <input type="hidden" name="id" value={g.id} />
                      <input type="hidden" name="date" value={date} />
                      <input type="hidden" name="category" value={g.category} />

                      <div className="min-w-[9rem] flex-1">
                        <label className={labelCls}>1-jamoa</label>
                        <input name="team1" defaultValue={g.team1} className={inputCls} required />
                      </div>
                      <div className="min-w-[9rem] flex-1">
                        <label className={labelCls}>2-jamoa</label>
                        <input name="team2" defaultValue={g.team2} className={inputCls} required />
                      </div>
                      <div className="w-20">
                        <label className={labelCls}>Vaqti</label>
                        <input name="time" defaultValue={g.time} className={inputCls} />
                      </div>
                      <div className="w-40">
                        <label className={labelCls}>Holati</label>
                        <select name="status" defaultValue={g.status} className={selectCls}>
                          <option value="rejalashtirilgan">Hali boshlanmadi</option>
                          <option value="jonli">Jonli</option>
                          <option value="tugadi">Tugadi</option>
                        </select>
                      </div>
                      <div className="w-16">
                        <label className={labelCls}>Hisob 1</label>
                        <input name="score1" type="number" defaultValue={g.score1 ?? ""} className={inputCls} />
                      </div>
                      <div className="w-16">
                        <label className={labelCls}>Hisob 2</label>
                        <input name="score2" type="number" defaultValue={g.score2 ?? ""} className={inputCls} />
                      </div>

                      <button
                        type="submit"
                        className="rounded border border-line bg-bg px-3 py-2 text-sm font-semibold hover:bg-line"
                      >
                        Saqlash
                      </button>
                      <button
                        type="submit"
                        formAction={deleteGameAction}
                        className="rounded border border-line px-3 py-2 text-sm font-semibold text-[#C93B3B] hover:bg-line"
                        formNoValidate
                      >
                        O'chirish
                      </button>
                    </form>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
