// API-SPORTS (api-sports.io) orqali futbol va MMA o'yinlarini avtomatik olib kelish.
//
// MUHIM: bu funksiyalar faqat admin "Avtomatik yuklash" tugmasini bosganda chaqiriladi,
// oddiy tashrifchi sahifani ochganda EMAS - bepul reja kuniga atigi 100 so'rovga
// cheklangan (har sport turi uchun alohida), shuning uchun uni tejash kerak.
//
// Kerakli environment variable: API_SPORTS_KEY (dashboard.api-football.com'dagi kalitingiz,
// Football va MMA uchun bitta xil kalit ishlaydi).

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
};

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

async function apiSportsGet<T>(host: string, path: string): Promise<T | null> {
  if (!KEY) return null; // kalit hali qo'shilmagan bo'lsa, jim tarzda hech narsa qaytarmaymiz
  try {
    const res = await fetch(`https://${host}.api-sports.io${path}`, {
      headers: { "x-apisports-key": KEY },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/* ---------- Futbol: O'zbekiston Superligasi ---------- */

type LeagueInfo = { id: number; season: number };
const UZ_LEAGUE_CACHE_KEY = "sports-api:uz-football-league";

// Liga ID va joriy mavsum raqami kamdan-kam o'zgaradi - bir marta topib, KV'da saqlab qo'yamiz.
async function getUzLeague(): Promise<LeagueInfo | null> {
  const cached = await kvGet(UZ_LEAGUE_CACHE_KEY).catch(() => null);
  if (cached) {
    try {
      return JSON.parse(cached) as LeagueInfo;
    } catch {
      /* buzilgan kesh - qaytadan izlaymiz */
    }
  }

  type LeaguesResponse = {
    response: {
      league: { id: number; name: string; type: string };
      seasons: { year: number; current: boolean }[];
    }[];
  };
  const data = await apiSportsGet<LeaguesResponse>("v3.football", "/leagues?country=Uzbekistan");
  const found = data?.response.find((r) => r.league.type === "League" && /super/i.test(r.league.name));
  const season = found?.seasons.find((s) => s.current)?.year;
  if (!found || !season) return null;

  const info: LeagueInfo = { id: found.league.id, season };
  await kvSet(UZ_LEAGUE_CACHE_KEY, JSON.stringify(info)).catch(() => {});
  return info;
}

function mapFootballStatus(short: string): GameStatus {
  if (["1H", "2H", "HT", "ET", "P", "LIVE", "BT"].includes(short)) return "jonli";
  if (["FT", "AET", "PEN"].includes(short)) return "tugadi";
  return "rejalashtirilgan";
}

export async function fetchFootballGamesToday(): Promise<FetchedGame[]> {
  const league = await getUzLeague();
  if (!league) return [];

  type FixturesResponse = {
    response: {
      fixture: { date: string; status: { short: string } };
      teams: { home: { name: string }; away: { name: string } };
      goals: { home: number | null; away: number | null };
    }[];
  };
  const data = await apiSportsGet<FixturesResponse>(
    "v3.football",
    `/fixtures?league=${league.id}&season=${league.season}&date=${todayTashkent()}`
  );
  if (!data) return [];

  return data.response.map((f) => ({
    team1: f.teams.home.name,
    team2: f.teams.away.name,
    time: tashkentTime(f.fixture.date),
    status: mapFootballStatus(f.fixture.status.short),
    score1: f.goals.home,
    score2: f.goals.away,
  }));
}

/* ---------- MMA ---------- */
// Diqqat: bu qismning maydon nomlari (teams.home/away) API-Sports oilasidagi boshqa
// sport turlariga (basketbol, hokkey va h.k.) qarab olingan taxmin - MMA'ga xos
// nozikliklar bo'lsa, birinchi sinovdan keyin moslashtiramiz.

function mapMmaStatus(short: string | undefined): GameStatus {
  if (!short || short === "NS" || short === "TBD") return "rejalashtirilgan";
  if (short === "FT" || short === "FIN") return "tugadi";
  return "jonli";
}

export async function fetchMmaGamesToday(): Promise<FetchedGame[]> {
  type FightsResponse = {
    response: {
      date: string;
      status?: { short?: string };
      teams?: { home?: { name?: string }; away?: { name?: string } };
    }[];
  };
  const data = await apiSportsGet<FightsResponse>("v1.mma", `/fights?date=${todayTashkent()}`);
  if (!data) return [];

  return data.response
    .filter((f) => f.teams?.home?.name && f.teams?.away?.name)
    .map((f) => ({
      team1: f.teams!.home!.name!,
      team2: f.teams!.away!.name!,
      time: tashkentTime(f.date),
      status: mapMmaStatus(f.status?.short),
      score1: null,
      score2: null,
    }));
}
