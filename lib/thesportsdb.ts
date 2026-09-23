// TheSportsDB orqali football-data.org qamramaydigan turnirlarni olish:
// O'zbekiston Superligasi va UEFA Yevropa Ligasi.
//
// Bepul, ochiq test kaliti ("3") ishlatiladi - ro'yxatdan o'tish shart emas, lekin
// limit past (~30 so'rov/daqiqa umumiy). Xohlasangiz patreon.com/thesportsdb orqali
// shaxsiy bepul/pullik kalit olib, Vercel'da THESPORTSDB_KEY qilib qo'yishingiz mumkin -
// shunda limit yuqoriroq bo'ladi.
//
// DIQQAT: bu ma'lumotlar foydalanuvchilar tomonidan to'ldiriladigan (crowd-sourced)
// ochiq bazadan kelgani uchun sifat notekis bo'lishi mumkin - ayrim kunlar uchun
// ma'lumot umuman bo'lmasligi yoki kechroq qo'shilishi mumkin. Bepul reja "jonli"
// hisobni real vaqtda yangilamaydi (faqat pullik Premium V2'da bor) - shuning uchun
// hisob mavjud bo'lsa "tugadi", aks holda "rejalashtirilgan" deb belgilanadi.

import type { FetchedGame, LeagueDef, SyncFailReason, SyncResult } from "./sports-api";
import type { GameStatus } from "./games";

const KEY = process.env.THESPORTSDB_KEY || "3";

type TSDBEvent = {
  strLeague: string | null;
  strHomeTeam: string | null;
  strAwayTeam: string | null;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strTime: string | null;
  strTimestamp: string | null;
  strStatus: string | null;
};

type EventsDayResponse = { events: TSDBEvent[] | null };

function mapStatus(status: string | null, hasScore: boolean): GameStatus {
  const s = (status ?? "").toUpperCase().trim();
  if (["FT", "FINISHED", "MATCH FINISHED", "AET", "AP", "FT_PEN"].includes(s)) return "tugadi";
  if (["1H", "2H", "HT", "LIVE", "IN PLAY", "ET"].includes(s)) return "jonli";
  if (!s && hasScore) return "tugadi";
  return "rejalashtirilgan";
}

function eventTime(e: TSDBEvent): string {
  if (e.strTimestamp) {
    try {
      return new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Tashkent",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(e.strTimestamp));
    } catch {
      /* pastdagi strTime fallback ishlatiladi */
    }
  }
  return (e.strTime ?? "").slice(0, 5);
}

// `date`: "YYYY-MM-DD" — Kecha/Bugun/Ertaga tabidan tanlangan sana.
export async function fetchTheSportsDbLeagueGames(def: LeagueDef, date: string): Promise<SyncResult> {
  if (!def.theSportsDbMatch) return { ok: false, reason: "not_found" };
  const res = await tsdbEventsDay(date, "Soccer");
  if (!res.ok) return res;
  const matched = res.events.filter((e) => def.theSportsDbMatch!.test(e.strLeague ?? ""));
  return { ok: true, games: matched.map((e) => toFetchedGame(e, def.label)) };
}

// Tennis va boks kabi sport turlarida "liga" tushunchasi yo'q (turnirlar har hafta
// o'zgaradi) - shuning uchun kunlik BARCHA o'yin/janglarni bitta so'rov bilan olamiz,
// har birining o'z turniri nomi (strLeague) "league" maydoniga yoziladi (guruhlash uchun).
export async function fetchTheSportsDbSportGames(sport: string, date: string): Promise<SyncResult> {
  const res = await tsdbEventsDay(date, sport);
  if (!res.ok) return res;
  return { ok: true, games: res.events.map((e) => toFetchedGame(e, e.strLeague ?? undefined)) };
}

async function tsdbEventsDay(
  date: string,
  sport: string
): Promise<{ ok: true; events: TSDBEvent[] } | { ok: false; reason: SyncFailReason; detail?: string }> {
  try {
    const res = await fetch(`https://www.thesportsdb.com/api/v1/json/${KEY}/eventsday.php?d=${date}&s=${encodeURIComponent(sport)}`, {
      cache: "no-store",
    });
    if (res.status === 429) return { ok: false, reason: "rate_limited" };

    let json: unknown = null;
    try {
      json = await res.json();
    } catch {
      /* javob JSON emas - pastda umumiy xato sifatida qaytariladi */
    }
    if (!res.ok) return { ok: false, reason: "http_error", detail: `HTTP ${res.status}` };

    const events = ((json as EventsDayResponse | null)?.events ?? []).filter((e) => e.strHomeTeam && e.strAwayTeam);
    return { ok: true, events };
  } catch {
    return { ok: false, reason: "network_error" };
  }
}

function toFetchedGame(e: TSDBEvent, league: string | undefined): FetchedGame {
  const score1 = e.intHomeScore !== null ? Number(e.intHomeScore) : null;
  const score2 = e.intAwayScore !== null ? Number(e.intAwayScore) : null;
  return {
    team1: e.strHomeTeam!,
    team2: e.strAwayTeam!,
    time: eventTime(e),
    status: mapStatus(e.strStatus, score1 !== null),
    score1,
    score2,
    league,
  };
}
