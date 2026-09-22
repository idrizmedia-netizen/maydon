"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { USER_SESSION_COOKIE, verifyUserSession } from "@/lib/user-auth";
import { changePassword, getUserById, updateUserProfile, verifyPassword } from "@/lib/users";

export type FormState = { error: string | null; ok?: boolean };

async function requireUserId(): Promise<string> {
  const id = await verifyUserSession((await cookies()).get(USER_SESSION_COOKIE)?.value);
  if (!id) redirect("/kirish");
  return id;
}

export async function updateProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const id = await requireUserId();
  const nickname = String(formData.get("nickname") ?? "").trim();
  const avatar = String(formData.get("avatar") ?? "");
  if (!nickname) return { error: "Ism bo'sh bo'lmasin." };
  await updateUserProfile(id, { nickname, avatar });
  revalidatePath("/profil");
  return { error: null, ok: true };
}

export async function changePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const id = await requireUserId();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  if (next.length < 6) return { error: "Yangi parol kamida 6 belgidan iborat bo'lsin." };

  const user = await getUserById(id);
  if (!user || !(await verifyPassword(user, current))) {
    return { error: "Joriy parol noto'g'ri." };
  }
  await changePassword(id, next);
  return { error: null, ok: true };
}

export async function userLogoutAction() {
  (await cookies()).delete(USER_SESSION_COOKIE);
  redirect("/");
}
