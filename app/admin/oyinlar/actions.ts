"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { addGame, deleteGame, getGames, updateGame, type GameStatus } from "@/lib/games";
import { todayTashkent, dateTashkent } from "@/lib/format";
import {
  fetchMmaGamesForDate,
  FOOTBALL_LEAGUES,
  type FetchedGame,
  type LeagueKey,
  type SyncFailReason,
  type SyncResult,
} from "@/lib/sports-api";
import { fetchFootballDataLeagueGames } from "@/lib/football-data";
import { fetchTheSportsDbLeagueGames, fetchTheSportsDbSportGames } from "@/lib/thesportsdb";

async function requireAdmin() {
  const ok = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!ok) throw new Error("Ruxsat yo'q");
}

// Forma qaysi kun (Kecha/Bugun/Ertaga) tabida to'ldirilgan bo'lsa, o'sha sanaga yoziladi.
function getDate(formData: FormData): string {
  const d = String(formData.get("date") ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : todayTashkent();
}

export async function addGameAction(formData: FormData) {
  await requireAdmin();
  const date = getDate(formData);
  const s1 = formData.get("score1");
  const s2 = formData.get("score2");
  await addGame(
    {
      category: String(formData.get("category") ?? "boshqa"),
      team1: String(formData.get("team1") ?? "").trim(),
      team2: String(formData.get("team2") ?? "").trim(),
      time: String(formData.get("time") ?? "").trim(),
      status: (String(formData.get("status") ?? "rejalashtirilgan") as GameStatus),
      score1: s1 ? Number(s1) : null,
      score2: s2 ? Number(s2) : null,
    },
    date
  );
  revalidatePath("/admin/oyinlar");
  revalidatePath("/");
}

export async function updateGameAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const date = getDate(formData);
  const s1 = formData.get("score1");
  const s2 = formData.get("score2");
  await updateGame(
    id,
    {
      category: String(formData.get("category") ?? "boshqa"),
      team1: String(formData.get("team1") ?? "").trim(),
      team2: String(formData.get("team2") ?? "").trim(),
      time: String(formData.get("time") ?? "").trim(),
      status: (String(formData.get("status") ?? "rejalashtirilgan") as GameStatus),
      score1: s1 ? Number(s1) : null,
      score2: s2 ? Number(s2) : null,
    },
    date
  );
  revalidatePath("/admin/oyinlar");
  revalidatePath("/");
}

export async function deleteGameAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const date = getDate(formData);
  await deleteGame(id, date);
  revalidatePath("/admin/oyinlar");
  revalidatePath("/");
}

// API'dan olingan o'yinlarni shu kungi (tab'da tanlangan sana) ro'yxatga qo'shadi:
// nomlari mos keladigan o'yin allaqachon bo'lsa - yangilaydi (hisob/holat/liga),
// bo'lmasa - yangi qo'shadi.
async function syncCategory(category: string, fetched: FetchedGame[], date: string): Promise<number> {
  const existing = await getGames(date);
  for (const g of fetched) {
    const match = existing.find(
      (e) =>
        e.category === category &&
        e.team1.toLowerCase() === g.team1.toLowerCase() &&
        e.team2.toLowerCase() === g.team2.toLowerCase()
    );
    if (match) {
      await updateGame(match.id, { ...g, category }, date);
    } else {
      await addGame({ ...g, category }, date);
    }
  }
  return fetched.length;
}

// Sync natijasidan keyin admin sahifasiga natija/xato haqida xabar bilan qaytaradi
// (?sync=ok&league=...&count=... yoki ?sync=err&league=...&reason=...), qaysi tabda
// (Kecha/Bugun/Ertaga) turgan bo'lsa o'sha tabga qaytaradi (?kun=...).
function syncRedirectUrl(leagueKey: string, result: SyncResult, count: number, offset: number): string {
  const params = new URLSearchParams({ league: leagueKey, kun: String(offset) });
  if (result.ok) {
    params.set("sync", "ok");
    params.set("count", String(count));
  } else {
    params.set("sync", "err");
    params.set("reason", result.reason);
    if (result.detail) params.set("detail", result.detail);
  }
  return `/admin/oyinlar?${params.toString()}`;
}

// `offset`: -1 = Kecha, 0 = Bugun, 1 = Ertaga (page.tsx'dagi TABS bilan bir xil) -
// forma tugmasiga .bind(null, key, offset) orqali beriladi, shuning uchun har bir
// sync tab qaysi kun ustida turilgan bo'lsa o'sha kunni API'dan so'raydi.
export async function syncLeagueAction(leagueKey: LeagueKey, offset: number, _formData: FormData) {
  await requireAdmin();
  const date = dateTashkent(offset);
  const def = FOOTBALL_LEAGUES.find((l) => l.key === leagueKey);
  const result: SyncResult = !def
    ? { ok: false, reason: "not_found" }
    : def.source === "football-data"
    ? await fetchFootballDataLeagueGames(def, date)
    : await fetchTheSportsDbLeagueGames(def, date);
  const count = result.ok ? await syncCategory("futbol", result.games, date) : 0;
  revalidatePath("/admin/oyinlar");
  revalidatePath("/oyinlar");
  revalidatePath("/");
  redirect(syncRedirectUrl(leagueKey, result, count, offset));
}

export async function syncMmaAction(offset: number, _formData: FormData) {
  await requireAdmin();
  const date = dateTashkent(offset);
  const result = await fetchMmaGamesForDate(date);
  const count = result.ok ? await syncCategory("mma", result.games, date) : 0;
  revalidatePath("/admin/oyinlar");
  revalidatePath("/oyinlar");
  revalidatePath("/");
  redirect(syncRedirectUrl("mma", result, count, offset));
}

export async function syncTennisAction(offset: number, _formData: FormData) {
  await requireAdmin();
  const date = dateTashkent(offset);
  const result = await fetchTheSportsDbSportGames("Tennis", date);
  const count = result.ok ? await syncCategory("tennis", result.games, date) : 0;
  revalidatePath("/admin/oyinlar");
  revalidatePath("/oyinlar");
  revalidatePath("/");
  redirect(syncRedirectUrl("tennis", result, count, offset));
}

export async function syncBoxingAction(offset: number, _formData: FormData) {
  await requireAdmin();
  const date = dateTashkent(offset);
  const result = await fetchTheSportsDbSportGames("Boxing", date);
  const count = result.ok ? await syncCategory("boks", result.games, date) : 0;
  revalidatePath("/admin/oyinlar");
  revalidatePath("/oyinlar");
  revalidatePath("/");
  redirect(syncRedirectUrl("boks", result, count, offset));
}

export type { SyncFailReason };
