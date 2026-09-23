// football-data.org orqali yirik Yevropa chempionatlari va Chempionlar Ligasi o'yinlarini olish.
// Bepul reja mangu bepul (to'lov talab qilinmaydi), lekin faqat belgilangan turnirlarni
// qamraydi (O'zbekiston Superligasi va UEFA Yevropa Ligasi bu yerda YO'Q -
// ular lib/thesportsdb.ts orqali olinadi). Limit: 10 so'rov/daqiqa.
//
// Kalitni bepul olish: www.football-data.org/client/register - ro'yxatdan o'tgach
// emailingizga token keladi, uni Vercel'da FOOTBALL_DATA_TOKEN nomi bilan qo'shing.

import { tashkentTime, type FetchedGame, type LeagueDef, type SyncResult } from "./sports-api";
import type { GameStatus } from "./games";

const TOKEN = process.env.FOOTBALL_DATA_TOKEN;

type FDStatus = "SCHEDULED" | "TIMED" | "IN_PLAY" | "PAUSED" | "FINISHED" | "POSTPONED" | "SUSPENDED" | "CANCELLED" | "AWARDED";

function mapStatus(status: FDStatus): GameStatus {
  if (status === "IN_PLAY" || status === "PAUSED") return "jonli";
  if (status === "FINISHED" || status === "AWARDED") return "tugadi";
  return "rejalashtirilgan";
}

type MatchesResponse = {
  matches: {
    utcDate: string;
    status: FDStatus;
    homeTeam: { name: string | null };
    awayTeam: { name: string | null };
    score: { fullTime: { home: number | null; away: number | null } };
  }[];
};

// `date`: "YYYY-MM-DD" — Kecha/Bugun/Ertaga tabidan tanlangan sana.
export async function fetchFootballDataLeagueGames(def: LeagueDef, date: string): Promise<SyncResult> {
  if (!TOKEN) return { ok: false, reason: "no_key", detail: "FOOTBALL_DATA_TOKEN topilmadi" };
  if (!def.footballDataCode) return { ok: false, reason: "not_found" };

  try {
    const res = await fetch(
      `https://api.football-data.org/v4/competitions/${def.footballDataCode}/matches?dateFrom=${date}&dateTo=${date}`,
      { headers: { "X-Auth-Token": TOKEN }, cache: "no-store" }
    );
    if (res.status === 429) return { ok: false, reason: "rate_limited" };

    let json: unknown = null;
    try {
      json = await res.json();
    } catch {
      /* javob JSON emas - pastda umumiy xato sifatida qaytariladi */
    }

    if (!res.ok) {
      const detail = (json as { message?: string } | null)?.message;
      return { ok: false, reason: "http_error", detail: detail ? detail.slice(0, 200) : `HTTP ${res.status}` };
    }

    const data = json as MatchesResponse;
    const games: FetchedGame[] = (data.matches ?? []).map((m) => ({
      team1: m.homeTeam.name ?? "?",
      team2: m.awayTeam.name ?? "?",
      time: tashkentTime(m.utcDate),
      status: mapStatus(m.status),
      score1: m.score.fullTime.home,
      score2: m.score.fullTime.away,
      league: def.label,
    }));
    return { ok: true, games };
  } catch {
    return { ok: false, reason: "network_error" };
  }
}
