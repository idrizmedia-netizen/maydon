"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { addGame, deleteGame, updateGame, type GameStatus } from "@/lib/games";

async function requireAdmin() {
  const ok = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!ok) throw new Error("Ruxsat yo'q");
}

export async function addGameAction(formData: FormData) {
  await requireAdmin();
  const s1 = formData.get("score1");
  const s2 = formData.get("score2");
  await addGame({
    category: String(formData.get("category") ?? "boshqa"),
    team1: String(formData.get("team1") ?? "").trim(),
    team2: String(formData.get("team2") ?? "").trim(),
    time: String(formData.get("time") ?? "").trim(),
    status: (String(formData.get("status") ?? "rejalashtirilgan") as GameStatus),
    score1: s1 ? Number(s1) : null,
    score2: s2 ? Number(s2) : null,
  });
  revalidatePath("/admin/oyinlar");
  revalidatePath("/");
}

export async function updateGameAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const s1 = formData.get("score1");
  const s2 = formData.get("score2");
  await updateGame(id, {
    category: String(formData.get("category") ?? "boshqa"),
    team1: String(formData.get("team1") ?? "").trim(),
    team2: String(formData.get("team2") ?? "").trim(),
    time: String(formData.get("time") ?? "").trim(),
    status: (String(formData.get("status") ?? "rejalashtirilgan") as GameStatus),
    score1: s1 ? Number(s1) : null,
    score2: s2 ? Number(s2) : null,
  });
  revalidatePath("/admin/oyinlar");
  revalidatePath("/");
}

export async function deleteGameAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteGame(id);
  revalidatePath("/admin/oyinlar");
  revalidatePath("/");
}
