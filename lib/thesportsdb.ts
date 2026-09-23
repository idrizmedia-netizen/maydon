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

import { todayTashkent } from "./format";
import type { FetchedGame, LeagueDef, SyncResult } from "./sports-api";
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

export async function fetchTheSportsDbLeagueGames(def: LeagueDef): Promise<SyncResult> {
  if (!def.theSportsDbMatch) return { ok: false, reason: "not_found" };

  const date = todayTashkent();
  try {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/${KEY}/eventsday.php?d=${date}&s=Soccer`,
      { cache: "no-store" }
    );
    if (res.status === 429) return { ok: false, reason: "rate_limited" };

    let json: unknown = null;
    try {
      json = await res.json();
    } catch {
      /* javob JSON emas - pastda umumiy xato sifatida qaytariladi */
    }

    if (!res.ok) return { ok: false, reason: "http_error", detail: `HTTP ${res.status}` };

    const events = (json as EventsDayResponse | null)?.events ?? [];
    const matched = events.filter((e) => def.theSportsDbMatch!.test(e.strLeague ?? ""));

    const games: FetchedGame[] = matched
      .filter((e) => e.strHomeTeam && e.strAwayTeam)
      .map((e) => {
        const score1 = e.intHomeScore !== null ? Number(e.intHomeScore) : null;
        const score2 = e.intAwayScore !== null ? Number(e.intAwayScore) : null;
        return {
          team1: e.strHomeTeam!,
          team2: e.strAwayTeam!,
          time: eventTime(e),
          status: mapStatus(e.strStatus, score1 !== null),
          score1,
          score2,
          league: def.label,
        };
      });
    return { ok: true, games };
  } catch {
    return { ok: false, reason: "network_error" };
  }
}
