// API-SPORTS (api-sports.io) orqali futbol va MMA o'yinlarini avtomatik olib kelish.
//
// MUHIM: bu funksiyalar faqat admin "Avtomatik yuklash" tugmasini bosganda chaqiriladi,
// oddiy tashrifchi sahifani ochganda EMAS - bepul reja kuniga atigi 100 so'rovga
// cheklangan (har mahsulot/sport turi uchun ALOHIDA - futbol va MMA ikkita alohida
// mahsulot, ikkalasiga ham dashboard.api-football.com'da alohida obuna kerak,
// hattoki kalit bitta bo'lsa ham).
//
// Kerakli environment variable: API_SPORTS_KEY (dashboard.api-football.com'dagi kalitingiz).

import { kvGet, kvSet } from "./kv";
import { todayTashkent } from "./format";
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

function tashkentTime(iso: string): string {
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

type ApiResult<T> = { ok: true; data: T } | { ok: false; reason: SyncFailReason; detail?: string };

// API-Sports ba'zan HTTP 200 bilan javob berib, xatoni "errors" maydonida qaytaradi
// (masalan, shu mahsulotga obuna bo'lmaganda yoki daqiqalik limitga tegib ketganda) -
// shuni ham xato deb hisoblaymiz va matnini admin panelga ko'rsatish uchun ajratib olamiz.
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

async function apiSportsGet<T>(host: string, path: string): Promise<ApiResult<T>> {
  if (!KEY) return { ok: false, reason: "no_key" };
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

/* ---------- Futbol: ligalar ro'yxati ---------- */

export type LeagueKey =
  | "uzbekistan"
  | "premier-league"
  | "la-liga"
  | "serie-a"
  | "bundesliga"
  | "ligue-1"
  | "champions-league"
  | "europa-league";

// apiId berilgan bo'lsa - doimiy (barqaror) API-Football liga ID'si.
// Berilmasa (O'zbekiston) - nomi bo'yicha dinamik qidiriladi (quyida).
export const FOOTBALL_LEAGUES: { key: LeagueKey; label: string; apiId?: number }[] = [
  { key: "uzbekistan", label: "O'zbekiston Superligasi" },
  { key: "premier-league", label: "Angliya - Premier Liga", apiId: 39 },
  { key: "la-liga", label: "Ispaniya - La Liga", apiId: 140 },
  { key: "serie-a", label: "Italiya - Seriya A", apiId: 135 },
  { key: "bundesliga", label: "Germaniya - Bundesliga", apiId: 78 },
  { key: "ligue-1", label: "Fransiya - Ligue 1", apiId: 61 },
  { key: "champions-league", label: "UEFA Chempionlar Ligasi", apiId: 2 },
  { key: "europa-league", label: "UEFA Yevropa Ligasi", apiId: 3 },
];

type LeagueInfo = { id: number; season: number };
type SeasonsResponse = { response: { league: { id: number; name: string; type: string }; seasons: { year: number; current: boolean }[] }[] };

// Barqaror ID'si bor liga uchun: joriy mavsum raqamini topib, KV'da keshlaydi
// (mavsum raqami taxminan yiliga bir marta o'zgaradi).
async function getLeagueSeasonById(apiId: number, cacheKey: string): Promise<ApiResult<LeagueInfo>> {
  const cached = await kvGet(cacheKey).catch(() => null);
  if (cached) {
    try {
      return { ok: true, data: JSON.parse(cached) as LeagueInfo };
    } catch {
      /* buzilgan kesh - qaytadan izlaymiz */
    }
  }
  const res = await apiSportsGet<SeasonsResponse>("v3.football", `/leagues?id=${apiId}`);
  if (!res.ok) return res;
  const season = res.data.response[0]?.seasons.find((s) => s.current)?.year;
  if (!season) return { ok: false, reason: "not_found" };
  const info: LeagueInfo = { id: apiId, season };
  await kvSet(cacheKey, JSON.stringify(info)).catch(() => {});
  return { ok: true, data: info };
}

// O'zbekiston Superligasi'ning ID'si barqaror emas deb topilgani uchun (dastlabki
// versiyada ham shunday edi) - mamlakat + nomi bo'yicha qidiramiz.
async function getUzLeague(): Promise<ApiResult<LeagueInfo>> {
  const cacheKey = "sports-api:league:uzbekistan";
  const cached = await kvGet(cacheKey).catch(() => null);
  if (cached) {
    try {
      return { ok: true, data: JSON.parse(cached) as LeagueInfo };
    } catch {
      /* buzilgan kesh - qaytadan izlaymiz */
    }
  }
  const res = await apiSportsGet<SeasonsResponse>("v3.football", "/leagues?country=Uzbekistan");
  if (!res.ok) return res;
  const found = res.data.response.find((r) => r.league.type === "League" && /super/i.test(r.league.name));
  const season = found?.seasons.find((s) => s.current)?.year;
  if (!found || !season) return { ok: false, reason: "not_found" };
  const info: LeagueInfo = { id: found.league.id, season };
  await kvSet(cacheKey, JSON.stringify(info)).catch(() => {});
  return { ok: true, data: info };
}

function mapFootballStatus(short: string): GameStatus {
  if (["1H", "2H", "HT", "ET", "P", "LIVE", "BT"].includes(short)) return "jonli";
  if (["FT", "AET", "PEN"].includes(short)) return "tugadi";
  return "rejalashtirilgan";
}

type FixturesResponse = {
  response: {
    fixture: { date: string; status: { short: string } };
    teams: { home: { name: string }; away: { name: string } };
    goals: { home: number | null; away: number | null };
  }[];
};

// Berilgan liga uchun BUGUNGI o'yinlarni oladi.
export async function fetchFootballLeagueGames(key: LeagueKey): Promise<SyncResult> {
  const def = FOOTBALL_LEAGUES.find((l) => l.key === key);
  if (!def) return { ok: false, reason: "not_found" };

  const leagueRes = def.apiId
    ? await getLeagueSeasonById(def.apiId, `sports-api:league:${def.key}`)
    : await getUzLeague();
  if (!leagueRes.ok) return leagueRes;

  const res = await apiSportsGet<FixturesResponse>(
    "v3.football",
    `/fixtures?league=${leagueRes.data.id}&season=${leagueRes.data.season}&date=${todayTashkent()}`
  );
  if (!res.ok) return res;

  const games: FetchedGame[] = res.data.response.map((f) => ({
    team1: f.teams.home.name,
    team2: f.teams.away.name,
    time: tashkentTime(f.fixture.date),
    status: mapFootballStatus(f.fixture.status.short),
    score1: f.goals.home,
    score2: f.goals.away,
    league: def.label,
  }));
  return { ok: true, games };
}

/* ---------- MMA ---------- */
// Diqqat: API-MMA (v1.mma.api-sports.io) asosiy futbol API'sidan ALOHIDA mahsulot -
// bir xil hisob/kalit bilan ishlaydi, lekin dashboard.api-football.com'da unga
// ALOHIDA obuna (bepul reja ham bo'lsa-da, faollashtirish kerak) bo'lishi shart,
// aks holda so'rovlar "http_error" bilan qaytadi.

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

export async function fetchMmaGamesToday(): Promise<SyncResult> {
  const res = await apiSportsGet<FightsResponse>("v1.mma", `/fights?date=${todayTashkent()}`);
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
