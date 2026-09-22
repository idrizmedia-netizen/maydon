"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { USER_SESSION_COOKIE, verifyUserSession } from "@/lib/user-auth";
import { getUserById } from "@/lib/users";
import { addComment, deleteComment } from "@/lib/comments";

export async function addCommentAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const text = String(formData.get("text") ?? "").trim();
  if (!slug || !text) return;

  const userId = await verifyUserSession((await cookies()).get(USER_SESSION_COOKIE)?.value);
  if (!userId) redirect("/kirish");
  const user = await getUserById(userId);
  if (!user) redirect("/kirish");

  await addComment(slug, { userId: user.id, nickname: user.nickname, avatar: user.avatar, text });
  revalidatePath(`/yangilik/${slug}`);
}

// Faqat admin (Google orqali kirgan) o'chira oladi
export async function deleteCommentAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!slug || !id) return;
  const isAdmin = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!isAdmin) return;
  await deleteComment(slug, id);
  revalidatePath(`/yangilik/${slug}`);
}
