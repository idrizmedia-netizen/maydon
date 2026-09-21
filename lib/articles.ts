import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";
import { getCategory } from "./config";

export type ArticleMeta = {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  category: string;
  excerpt: string;
  author: string;
  image?: string;
  featured: boolean;
  tags: string[];
  readingMinutes: number;
};

export type Article = ArticleMeta & { html: string };

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 180));
}

function parseFile(fileName: string) {
  const slug = fileName.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(ARTICLES_DIR, fileName), "utf8");
  const { data, content } = matter(raw);

  if (data.draft === true) return null;

  const category = getCategory(String(data.category ?? ""))?.slug ?? "boshqa";
  const dateValue = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date ?? "");

  const meta: ArticleMeta = {
    slug,
    title: String(data.title ?? slug),
    date: dateValue,
    category,
    excerpt: String(data.excerpt ?? ""),
    author: String(data.author ?? "Tahririyat"),
    image: data.image ? String(data.image) : undefined,
    featured: data.featured === true,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    readingMinutes: readingTime(content),
  };

  return { meta, content };
}

export function getAllArticles(): ArticleMeta[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".md"))
    .map(parseFile)
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .map((x) => x.meta)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export async function getArticle(slug: string): Promise<Article | null> {
  const fileName = `${slug}.md`;
  if (!fs.existsSync(path.join(ARTICLES_DIR, fileName))) return null;
  const parsed = parseFile(fileName);
  if (!parsed) return null;
  const processed = await remark().use(remarkHtml).process(parsed.content);
  return { ...parsed.meta, html: processed.toString() };
}

export function getArticlesByCategory(category: string): ArticleMeta[] {
  return getAllArticles().filter((a) => a.category === category);
}

export function getRelated(article: ArticleMeta, limit = 3): ArticleMeta[] {
  return getAllArticles()
    .filter((a) => a.slug !== article.slug)
    .sort((a, b) => {
      const score = (x: ArticleMeta) =>
        (x.category === article.category ? 2 : 0) + x.tags.filter((t) => article.tags.includes(t)).length;
      return score(b) - score(a);
    })
    .slice(0, limit);
}
