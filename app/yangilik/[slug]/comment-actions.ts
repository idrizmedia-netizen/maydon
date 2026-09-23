"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { USER_SESSION_COOKIE, verifyUserSession } from "@/lib/user-auth";
import { getUserById } from "@/lib/users";
import { addComment, deleteComment, getComments } from "@/lib/comments";

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

// Admin (Google orqali kirgan) yoki izohning o'zi egasi o'chira oladi
export async function deleteCommentAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!slug || !id) return;

  const jar = await cookies();
  const isAdmin = await verifySession(jar.get(SESSION_COOKIE)?.value);
  const userId = await verifyUserSession(jar.get(USER_SESSION_COOKIE)?.value);

  if (!isAdmin) {
    if (!userId) return;
    const comments = await getComments(slug);
    const own = comments.find((c) => c.id === id && c.userId === userId);
    if (!own) return; // faqat o'z izohini o'chira oladi
  }

  await deleteComment(slug, id);
  revalidatePath(`/yangilik/${slug}`);
}
