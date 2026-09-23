// O'yinlarni avtomatik yuklash uchun umumiy turlar va yordamchi funksiyalar, shuningdek
// API-SPORTS (api-sports.io) orqali MMA jangларini olib kelish.
//
// MUHIM: bu funksiyalar faqat admin "Avtomatik yuklash" tugmasini bosganda chaqiriladi,
// oddiy tashrifchi sahifani ochganda EMAS.
//
// Futbol endi UCHTA manbadan keladi (har birining kodi alohida faylda):
//   - lib/football-data.ts  -> football-data.org: Premier Liga, La Liga, Seriya A,
//     Bundesliga, Ligue 1, Chempionlar Ligasi (mangu bepul, lekin faqat shu bir
//     nechta yirik turnir). Kerakli env: FOOTBALL_DATA_TOKEN.
//   - lib/thesportsdb.ts    -> TheSportsDB: O'zbekiston Superligasi va UEFA Yevropa
//     Ligasi (football-data.org bularni bermaydi). Kerakli env (ixtiyoriy): THESPORTSDB_KEY.
//   - shu fayl              -> MMA: API-Sports (v1.mma.api-sports.io). Kerakli env:
//     API_SPORTS_KEY (dashboard.api-football.com'dagi kalitingiz).

import type { GameStatus } from "./games";

const KEY = process.env.API_SPORTS_KEY;

export type FetchedGame = {
  team1: string;
  team2: string;
  time: string;
  status: GameStatus;
  score1: number | null;
  score2: number | null;
  league?: string;
};

// Nima uchun muvaffaqiyatsiz bo'lganini admin panelda aniq ko'rsatish uchun.
export type SyncFailReason = "no_key" | "http_error" | "rate_limited" | "network_error" | "not_found";
export type SyncResult =
  | { ok: true; games: FetchedGame[] }
  | { ok: false; reason: SyncFailReason; detail?: string };

export function tashkentTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Tashkent",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

/* ---------- Futbol: ligalar ro'yxati (barcha manbalar uchun umumiy) ---------- */

export type LeagueKey =
  | "uzbekistan"
  | "premier-league"
  | "la-liga"
  | "serie-a"
  | "bundesliga"
  | "ligue-1"
  | "champions-league"
  | "europa-league";

export type LeagueSource = "football-data" | "thesportsdb";

export type LeagueDef = {
  key: LeagueKey;
  label: string;
  source: LeagueSource;
  footballDataCode?: string; // football-data.org musobaqa kodi (source: "football-data")
  theSportsDbMatch?: RegExp; // TheSportsDB'dagi strLeague nomiga moslashtirish uchun (source: "thesportsdb")
};

export const FOOTBALL_LEAGUES: LeagueDef[] = [
  { key: "uzbekistan", label: "O'zbekiston Superligasi", source: "thesportsdb", theSportsDbMatch: /uzbekistan/i },
  { key: "premier-league", label: "Angliya - Premier Liga", source: "football-data", footballDataCode: "PL" },
  { key: "la-liga", label: "Ispaniya - La Liga", source: "football-data", footballDataCode: "PD" },
  { key: "serie-a", label: "Italiya - Seriya A", source: "football-data", footballDataCode: "SA" },
  { key: "bundesliga", label: "Germaniya - Bundesliga", source: "football-data", footballDataCode: "BL1" },
  { key: "ligue-1", label: "Fransiya - Ligue 1", source: "football-data", footballDataCode: "FL1" },
  { key: "champions-league", label: "UEFA Chempionlar Ligasi", source: "football-data", footballDataCode: "CL" },
  { key: "europa-league", label: "UEFA Yevropa Ligasi", source: "thesportsdb", theSportsDbMatch: /europa league/i },
];

/* ---------- MMA: API-Sports ---------- */
// Diqqat: API-MMA (v1.mma.api-sports.io) asosiy futbol API'sidan ALOHIDA mahsulot -
// bir xil hisob/kalit bilan ishlaydi, lekin dashboard.api-football.com'da unga
// ALOHIDA obuna (bepul reja ham bo'lsa-da, faollashtirish kerak) bo'lishi shart,
// aks holda so'rovlar "http_error" bilan qaytadi. Bu qism, futboldan farqli o'laroq,
// joriy mavsum cheklovisiz ishlashi tasdiqlangan.

function hasApiErrors(json: unknown): boolean {
  const e = (json as { errors?: unknown } | null)?.errors;
  if (!e) return false;
  if (Array.isArray(e)) return e.length > 0;
  if (typeof e === "object") return Object.keys(e as object).length > 0;
  return false;
}

function extractErrorDetail(json: unknown): string | undefined {
  const e = (json as { errors?: unknown } | null)?.errors;
  if (!e) return undefined;
  if (Array.isArray(e)) return e.length ? String(e[0]).slice(0, 200) : undefined;
  if (typeof e === "object") {
    const vals = Object.values(e as Record<string, unknown>);
    return vals.length ? String(vals[0]).slice(0, 200) : undefined;
  }
  return String(e).slice(0, 200);
}

async function apiSportsGet<T>(
  host: string,
  path: string
): Promise<{ ok: true; data: T } | { ok: false; reason: SyncFailReason; detail?: string }> {
  if (!KEY) return { ok: false, reason: "no_key", detail: "API_SPORTS_KEY topilmadi" };
  try {
    const res = await fetch(`https://${host}.api-sports.io${path}`, {
      headers: { "x-apisports-key": KEY },
      cache: "no-store",
    });
    if (res.status === 429) return { ok: false, reason: "rate_limited" };

    let json: unknown = null;
    try {
      json = await res.json();
    } catch {
      /* javob JSON emas - pastda umumiy xato sifatida qaytariladi */
    }

    if (!res.ok) return { ok: false, reason: "http_error", detail: extractErrorDetail(json) ?? `HTTP ${res.status}` };
    if (hasApiErrors(json)) {
      const detail = extractErrorDetail(json);
      const rateLimited = detail ? /limit|too many|quota/i.test(detail) : false;
      return { ok: false, reason: rateLimited ? "rate_limited" : "http_error", detail };
    }
    return { ok: true, data: json as T };
  } catch {
    return { ok: false, reason: "network_error" };
  }
}

function mapMmaStatus(short: string | undefined): GameStatus {
  if (!short || short === "NS" || short === "TBD") return "rejalashtirilgan";
  if (short === "FT" || short === "FIN") return "tugadi";
  return "jonli";
}

type FightsResponse = {
  response: {
    date: string;
    status?: { short?: string };
    teams?: { home?: { name?: string }; away?: { name?: string } };
  }[];
};

// `date`: "YYYY-MM-DD" — Kecha/Bugun/Ertaga tabidan tanlangan sana (default: bugun,
// chaqiruvchi joyda beriladi).
export async function fetchMmaGamesForDate(date: string): Promise<SyncResult> {
  const res = await apiSportsGet<FightsResponse>("v1.mma", `/fights?date=${date}`);
  if (!res.ok) return res;

  const games: FetchedGame[] = res.data.response
    .filter((f) => f.teams?.home?.name && f.teams?.away?.name)
    .map((f) => ({
      team1: f.teams!.home!.name!,
      team2: f.teams!.away!.name!,
      time: tashkentTime(f.date),
      status: mapMmaStatus(f.status?.short),
      score1: null,
      score2: null,
    }));
  return { ok: true, games };
}
