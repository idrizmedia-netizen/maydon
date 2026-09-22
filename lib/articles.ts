import { cache } from "react";
import { remark } from "remark";
import remarkHtml from "remark-html";
import { getCategory } from "./config";
import { kvDel, kvGet, kvIncr, kvMget, kvMode, kvSet } from "./kv";
import { SEED_ARTICLES } from "./seed";
import { slugify } from "./slug";

export type Kind = "yangilik" | "maqola";
export type Media = "none" | "video" | "photo";

// Bazada saqlanadigan to'liq yozuv
export type StoredArticle = {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  category: string;
  kind: Kind;
  excerpt: string;
  author: string;
  image: string; // "" yoki rasm manzili
  featured: boolean;
  draft: boolean;
  tags: string[];
  content: string; // Markdown
  media?: Media; // "video" yoki "photo" bo'lsa, Video/Foto bo'limida ham chiqadi
  videoUrl?: string; // media = "video" bo'lganda: YouTube/Telegram video havolasi
  createdAt: number;
  updatedAt: number;
};

// Ro'yxatlar uchun (matnsiz)
export type ArticleMeta = Omit<StoredArticle, "content" | "image"> & {
  image?: string;
  readingMinutes: number;
  views: number;
};

export type Article = ArticleMeta & { html: string };

const INDEX_KEY = "art:index";
const SEEDED_KEY = "art:seeded";
const artKey = (slug: string) => `art:${slug}`;
const viewsKey = (slug: string) => `views:${slug}`;

function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 180));
}

function toMeta(a: StoredArticle, views = 0): ArticleMeta {
  const { content, image, ...rest } = a;
  return {
    ...rest,
    image: image || undefined,
    kind: a.kind === "yangilik" ? "yangilik" : "maqola",
    category: getCategory(a.category)?.slug ?? "boshqa",
    media: a.media ?? "none",
    readingMinutes: readingTime(content),
    views,
  };
}

// Bir nechta maqolaning ko'rishlar sonini bitta so'rovda oladi (ro'yxatlar uchun tez).
async function readViews(slugs: string[]): Promise<Record<string, number>> {
  if (slugs.length === 0) return {};
  const raw = await kvMget(slugs.map(viewsKey), { fresh: false }).catch(() => slugs.map(() => null));
  const out: Record<string, number> = {};
  slugs.forEach((slug, i) => {
    out[slug] = Number(raw[i]) || 0;
  });
  return out;
}

// Maqola ochilganda chaqiriladi: ko'rishlar sonini birga oshiradi.
// Baza ulanmagan bo'lsa jim o'tkazib yuboriladi - sahifa buzilmasligi uchun.
export async function incrementViews(slug: string): Promise<void> {
  if (kvMode() === "none") return;
  await kvIncr(viewsKey(slug)).catch(() => {});
}

function bySort(a: { date: string; createdAt: number }, b: { date: string; createdAt: number }) {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return b.createdAt - a.createdAt;
}

async function readIndex(fresh = false): Promise<string[]> {
  const raw = await kvGet(INDEX_KEY, { fresh });
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

// Bazadagi hamma maqolalar. Baza hali bo'sh (namunalar ko'chirilmagan) bo'lsa, namunalarni qaytaradi.
// Xato bo'lsa, ataylab xato tashlaydi: shunda Next.js eski (to'g'ri) sahifani saqlab qoladi.
async function readAllStored(fresh = false): Promise<StoredArticle[]> {
  const seeded = await kvGet(SEEDED_KEY, { fresh });
  if (!seeded) return SEED_ARTICLES;

  const slugs = await readIndex(fresh);
  if (slugs.length === 0) return [];

  const values = await kvMget(slugs.map(artKey), { fresh });
  const out: StoredArticle[] = [];
  for (const v of values) {
    if (!v) continue;
    try {
      out.push(JSON.parse(v) as StoredArticle);
    } catch {
      // buzilgan yozuvni o'tkazib yuboramiz
    }
  }
  return out;
}

const readPublic = cache(() => readAllStored(false));

/* ---------- Saytning ochiq qismi uchun ---------- */

export const getAllArticles = cache(async (): Promise<ArticleMeta[]> => {
  const all = await readPublic();
  const published = all.filter((a) => !a.draft);
  const views = await readViews(published.map((a) => a.slug));
  return published.map((a) => toMeta(a, views[a.slug])).sort(bySort);
});

export async function getArticle(slug: string): Promise<Article | null> {
  const all = await readPublic();
  const found = all.find((a) => a.slug === slug && !a.draft);
  if (!found) return null;
  const html = String(await remark().use(remarkHtml).process(found.content));
  const views = await readViews([slug]);
  return { ...toMeta(found, views[slug]), html };
}

// Eng ko'p o'qilgan maqolalar - "Qaynoq yangiliklar" bloki uchun.
export async function getMostViewed(limit = 8, excludeSlug?: string): Promise<ArticleMeta[]> {
  const all = await getAllArticles();
  return all
    .filter((a) => a.slug !== excludeSlug)
    .sort((a, b) => b.views - a.views || bySort(a, b))
    .slice(0, limit);
}

export async function getArticlesByCategory(category: string): Promise<ArticleMeta[]> {
  return (await getAllArticles()).filter((a) => a.category === category);
}

// Video yoki Foto bo'limi uchun: media turi bo'yicha filtrlaydi.
export async function getArticlesByMedia(media: Media, limit?: number): Promise<ArticleMeta[]> {
  const all = (await getAllArticles()).filter((a) => a.media === media);
  return typeof limit === "number" ? all.slice(0, limit) : all;
}

export async function getRelated(article: ArticleMeta, limit = 3): Promise<ArticleMeta[]> {
  const all = await getAllArticles();
  return all
    .filter((a) => a.slug !== article.slug)
    .sort((a, b) => {
      const score = (x: ArticleMeta) =>
        (x.category === article.category ? 2 : 0) + x.tags.filter((t) => article.tags.includes(t)).length;
      return score(b) - score(a);
    })
    .slice(0, limit);
}

/* ---------- Admin panel uchun ---------- */

// Namunalarni bazaga bir marta ko'chiradi (shundan keyin ularni tahrirlash/o'chirish mumkin)
async function ensureSeeded() {
  if (kvMode() === "none") return;
  if (await kvGet(SEEDED_KEY, { fresh: true })) return;
  for (const s of SEED_ARTICLES) await kvSet(artKey(s.slug), JSON.stringify(s));
  await kvSet(INDEX_KEY, JSON.stringify(SEED_ARTICLES.map((s) => s.slug)));
  await kvSet(SEEDED_KEY, "1");
}

export async function getAdminArticles(): Promise<StoredArticle[]> {
  await ensureSeeded();
  const all = await readAllStored(true);
  return all.sort(bySort);
}

export async function getStoredArticle(slug: string): Promise<StoredArticle | null> {
  const all = await readAllStored(true);
  return all.find((a) => a.slug === slug) ?? null;
}

export type ArticleInput = Omit<StoredArticle, "slug" | "createdAt" | "updatedAt"> & { slug?: string };

export async function saveArticle(input: ArticleInput): Promise<string> {
  await ensureSeeded();
  const index = await readIndex(true);

  let slug = input.slug;
  if (!slug) {
    slug = slugify(input.title);
    if (index.includes(slug)) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  }

  let createdAt = Date.now();
  const existingRaw = await kvGet(artKey(slug), { fresh: true });
  if (existingRaw) {
    try {
      createdAt = (JSON.parse(existingRaw) as StoredArticle).createdAt ?? createdAt;
    } catch {}
  }

  const record: StoredArticle = { ...input, slug, createdAt, updatedAt: Date.now() };
  await kvSet(artKey(slug), JSON.stringify(record));
  if (!index.includes(slug)) await kvSet(INDEX_KEY, JSON.stringify([...index, slug]));
  return slug;
}

export async function setDraft(slug: string, draft: boolean) {
  const a = await getStoredArticle(slug);
  if (!a) return;
  await ensureSeeded();
  await kvSet(artKey(slug), JSON.stringify({ ...a, draft, updatedAt: Date.now() }));
}

export async function deleteArticle(slug: string) {
  await ensureSeeded();
  const a = await getStoredArticle(slug);
  const index = await readIndex(true);
  await kvSet(INDEX_KEY, JSON.stringify(index.filter((s) => s !== slug)));
  await kvDel(artKey(slug));
  if (a?.image?.startsWith("/api/img/")) {
    await kvDel(`img:${a.image.replace("/api/img/", "")}`).catch(() => {});
  }
}
