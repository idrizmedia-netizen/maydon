import type { Metadata } from "next";
import Link from "next/link";
import { categories } from "@/lib/config";
import { getGames, type Game } from "@/lib/games";
import { dateTashkent, formatDate } from "@/lib/format";
import { addGameAction, deleteGameAction, syncLeagueAction, syncMmaAction, updateGameAction } from "./actions";
import { getTeamLogos } from "@/lib/team-logo";
import { FOOTBALL_LEAGUES } from "@/lib/sports-api";

const SYNC_REASON_LABEL: Record<string, string> = {
  no_key: "API kaliti (API_SPORTS_KEY) sozlanmagan. Vercel → Settings → Environment Variables'ga qo'shing va qayta deploy qiling.",
  http_error:
    "API xato qaytardi: kalit noto'g'ri bo'lishi yoki shu sport/liga uchun dashboard.api-football.com'da obuna faollashtirilmagan bo'lishi mumkin.",
  rate_limited: "Juda ko'p so'rov yuborildi (daqiqalik limit - 10 so'rov/daqiqa). Bir daqiqa kutib, qayta urinib ko'ring.",
  network_error: "Tarmoq xatosi yuz berdi. Birozdan keyin qayta urinib ko'ring.",
  not_found: "Bu turnir uchun joriy mavsum yoki liga topilmadi.",
};

function TeamLogo({ src }: { src: string | null }) {
  if (!src) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" width={28} height={28} className="shrink-0 rounded-full border border-line object-contain" />;
}

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

const LEAGUE_LABELS: Record<string, string> = {
  ...Object.fromEntries(FOOTBALL_LEAGUES.map((l) => [l.key, l.label])),
  mma: "MMA",
};

type Props = {
  searchParams: Promise<{ kun?: string; sync?: string; league?: string; count?: string; reason?: string; detail?: string }>;
};

export default async function GameCenterPage({ searchParams }: Props) {
  const sp = await searchParams;
  const offset = TABS.some((t) => String(t.offset) === sp.kun) ? Number(sp.kun) : 0;
  const date = dateTashkent(offset);
  const games = await getGames(date);
  const logos = await getTeamLogos(games.flatMap((g) => [g.team1, g.team2])).catch(() => ({} as Record<string, string | null>));

  const syncLeagueLabel = sp.league ? LEAGUE_LABELS[sp.league] ?? sp.league : null;

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

      {offset === 0 && sp.sync === "ok" && (
        <div className="mb-6 rounded border border-[#1B8A4B] bg-[#1B8A4B]/10 px-4 py-3 text-sm font-semibold text-[#1B8A4B]">
          {syncLeagueLabel}: {sp.count === "0" ? "bugun uchun o'yin topilmadi." : `${sp.count} ta o'yin yuklandi/yangilandi.`}
        </div>
      )}
      {offset === 0 && sp.sync === "err" && (
        <div className="mb-6 rounded border border-[#C93B3B] bg-[#C93B3B]/10 px-4 py-3 text-sm font-semibold text-[#C93B3B]">
          <p>
            {syncLeagueLabel} yuklanmadi: {SYNC_REASON_LABEL[sp.reason ?? ""] ?? "Noma'lum xatolik."}
          </p>
          {sp.detail && <p className="mt-1 font-normal opacity-90">API xabari: "{sp.detail}"</p>}
        </div>
      )}

      {offset === 0 && (
        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Avtomatik yuklash (bugungi o'yinlar)
          </p>
          <div className="flex flex-wrap gap-2">
            {FOOTBALL_LEAGUES.map((l) => (
              <form key={l.key} action={syncLeagueAction.bind(null, l.key)}>
                <button
                  type="submit"
                  className="rounded border border-line bg-bg px-3.5 py-2 text-sm font-semibold hover:bg-line"
                >
                  ⚽ {l.label}
                </button>
              </form>
            ))}
            <form action={syncMmaAction}>
              <button
                type="submit"
                className="rounded border border-line bg-bg px-3.5 py-2 text-sm font-semibold hover:bg-line"
              >
                🥊 MMA
              </button>
            </form>
          </div>
        </div>
      )}

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

            // Futbolda bir nechta turnir bo'lishi mumkin - ular ostida kichik sarlavha bilan guruhlaymiz.
            // Boshqa sport turlarida yoki liga belgilanmagan o'yinlarda oddiy ro'yxat ko'rinishida qoladi.
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
                  {group.items.map((g, i) => (
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
                        <div className="flex items-center gap-2">
                          <TeamLogo src={logos[g.team1] ?? null} />
                          <input name="team1" defaultValue={g.team1} className={inputCls} required />
                        </div>
                      </div>
                      <div className="min-w-[9rem] flex-1">
                        <label className={labelCls}>2-jamoa</label>
                        <div className="flex items-center gap-2">
                          <TeamLogo src={logos[g.team2] ?? null} />
                          <input name="team2" defaultValue={g.team2} className={inputCls} required />
                        </div>
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
                ))}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
