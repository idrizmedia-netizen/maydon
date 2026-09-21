"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { deleteArticle, getStoredArticle, saveArticle, setDraft, type Kind } from "@/lib/articles";
import { getCategory } from "@/lib/config";
import { NOT_CONFIGURED } from "@/lib/kv";
import { todayTashkent } from "@/lib/format";

export type FormState = { error: string | null };

async function requireAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!(await verifySession(token))) redirect("/admin/login");
}

function refreshSite() {
  revalidateTag("kv");
  revalidatePath("/", "layout");
}

function friendly(e: unknown): string {
  if (e instanceof Error && e.message === NOT_CONFIGURED) {
    return "Ma'lumotlar bazasi ulanmagan. README'dagi \"Upstash Redis ulash\" qadamini bajaring.";
  }
  return "Saqlashda xatolik yuz berdi. Birozdan keyin qayta urinib ko'ring.";
}

/* ---------- Chiqish ---------- */
// Kirish endi faqat Google orqali: app/api/auth/google/route.ts va .../callback/route.ts

export async function logoutAction() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

/* ---------- Maqolalar ---------- */

function text(fd: FormData, name: string, max: number) {
  return String(fd.get(name) ?? "").trim().slice(0, max);
}

export async function saveArticleAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const title = text(formData, "title", 160);
  const excerpt = text(formData, "excerpt", 300);
  const content = String(formData.get("content") ?? "").trim().slice(0, 100_000);
  const category = getCategory(text(formData, "category", 40))?.slug;
  const kind: Kind = text(formData, "kind", 20) === "yangilik" ? "yangilik" : "maqola";
  const image = text(formData, "image", 300);
  const dateRaw = text(formData, "date", 10);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(dateRaw) ? dateRaw : todayTashkent();
  const slug = text(formData, "slug", 90) || undefined;

  if (!title) return { error: "Sarlavha yozing." };
  if (!category) return { error: "Sport bo'limini tanlang." };
  if (!content) return { error: "Maqola matnini yozing." };
  if (image && !/^(\/api\/img\/[a-z0-9]+|https?:\/\/\S+)$/.test(image)) {
    return { error: "Rasm manzili noto'g'ri." };
  }

  const tags = text(formData, "tags", 300)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 10);

  try {
    await saveArticle({
      slug,
      title,
      excerpt,
      content,
      category,
      kind,
      image,
      date,
      author: text(formData, "author", 80) || "Tahririyat",
      featured: formData.get("featured") === "on",
      draft: formData.get("draft") === "on",
      tags,
    });
  } catch (e) {
    return { error: friendly(e) };
  }

  refreshSite();
  redirect("/admin?ok=saqlandi");
}

export async function deleteArticleAction(formData: FormData) {
  await requireAdmin();
  const slug = text(formData, "slug", 90);
  if (slug) {
    try {
      await deleteArticle(slug);
    } catch {
      redirect("/admin?ok=xato");
    }
    refreshSite();
  }
  redirect("/admin?ok=ochirildi");
}

export async function toggleDraftAction(formData: FormData) {
  await requireAdmin();
  const slug = text(formData, "slug", 90);
  const a = slug ? await getStoredArticle(slug) : null;
  if (a) {
    try {
      await setDraft(slug, !a.draft);
    } catch {
      redirect("/admin?ok=xato");
    }
    refreshSite();
  }
  redirect("/admin?ok=yangilandi");
}
