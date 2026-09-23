"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { addGame, deleteGame, getGames, updateGame, type GameStatus } from "@/lib/games";
import { todayTashkent } from "@/lib/format";
import { fetchFootballGamesToday, fetchMmaGamesToday, type FetchedGame } from "@/lib/sports-api";

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

// API'dan olingan o'yinlarni shu kungi ro'yxatga qo'shadi: nomlari mos keladigan
// o'yin allaqachon bo'lsa - yangilaydi (hisob/holat), bo'lmasa - yangi qo'shadi.
async function syncCategory(category: string, fetched: FetchedGame[]) {
  const date = todayTashkent();
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
}

export async function syncFootballAction() {
  await requireAdmin();
  await syncCategory("futbol", await fetchFootballGamesToday());
  revalidatePath("/admin/oyinlar");
  revalidatePath("/oyinlar");
  revalidatePath("/");
}

export async function syncMmaAction() {
  await requireAdmin();
  await syncCategory("mma", await fetchMmaGamesToday());
  revalidatePath("/admin/oyinlar");
  revalidatePath("/oyinlar");
  revalidatePath("/");
}
