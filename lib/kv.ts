// Ma'lumotlar ombori.
//  - Vercel'da: Upstash Redis (KV_REST_API_URL va KV_REST_API_TOKEN o'zgaruvchilari orqali)
//  - Kompyuterda (npm run dev): oddiy fayl .data/store.json (hech narsa sozlash shart emas)
//  - Vercel'da baza ulanmagan bo'lsa: faqat o'qish (yozish xato beradi)

import { promises as fs } from "node:fs";
import path from "node:path";

export type KvMode = "redis" | "file" | "none";
export const NOT_CONFIGURED = "STORAGE_NOT_CONFIGURED";

function redisConfig() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

export function kvMode(): KvMode {
  if (redisConfig()) return "redis";
  if (!process.env.VERCEL) return "file";
  return "none";
}

type ReadOpts = { fresh?: boolean };

/* ---------- Redis (REST) ---------- */

function readInit(token: string, fresh?: boolean) {
  const headers = { Authorization: `Bearer ${token}` };
  return fresh
    ? { headers, cache: "no-store" as const }
    : { headers, next: { tags: ["kv"], revalidate: 120 } };
}

async function redisGet(key: string, opts?: ReadOpts): Promise<string | null> {
  const cfg = redisConfig()!;
  const res = await fetch(`${cfg.url}/get/${encodeURIComponent(key)}`, readInit(cfg.token, opts?.fresh));
  if (!res.ok) throw new Error(`KV GET xatosi: ${res.status}`);
  const json = (await res.json()) as { result: string | null };
  return json.result ?? null;
}

async function redisMget(keys: string[], opts?: ReadOpts): Promise<(string | null)[]> {
  const cfg = redisConfig()!;
  const out: (string | null)[] = [];
  for (let i = 0; i < keys.length; i += 100) {
    const chunk = keys.slice(i, i + 100);
    const res = await fetch(
      `${cfg.url}/mget/${chunk.map(encodeURIComponent).join("/")}`,
      readInit(cfg.token, opts?.fresh)
    );
    if (!res.ok) throw new Error(`KV MGET xatosi: ${res.status}`);
    const json = (await res.json()) as { result: (string | null)[] };
    out.push(...(json.result ?? []));
  }
  return out;
}

async function redisCmd(args: string[]): Promise<void> {
  const cfg = redisConfig()!;
  const res = await fetch(cfg.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`KV yozish xatosi: ${res.status}`);
}

/* ---------- Fayl (faqat lokal) ---------- */

const FILE = path.join(process.cwd(), ".data", "store.json");

async function readFileStore(): Promise<Record<string, string>> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return {};
  }
}

async function writeFileStore(data: Record<string, string>) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(data));
}

/* ---------- Umumiy interfeys ---------- */

export async function kvGet(key: string, opts?: ReadOpts): Promise<string | null> {
  const mode = kvMode();
  if (mode === "redis") return redisGet(key, opts);
  if (mode === "file") return (await readFileStore())[key] ?? null;
  return null;
}

export async function kvMget(keys: string[], opts?: ReadOpts): Promise<(string | null)[]> {
  if (keys.length === 0) return [];
  const mode = kvMode();
  if (mode === "redis") return redisMget(keys, opts);
  if (mode === "file") {
    const data = await readFileStore();
    return keys.map((k) => data[k] ?? null);
  }
  return keys.map(() => null);
}

export async function kvSet(key: string, value: string): Promise<void> {
  const mode = kvMode();
  if (mode === "redis") return redisCmd(["SET", key, value]);
  if (mode === "file") {
    const data = await readFileStore();
    data[key] = value;
    return writeFileStore(data);
  }
  throw new Error(NOT_CONFIGURED);
}

export async function kvDel(key: string): Promise<void> {
  const mode = kvMode();
  if (mode === "redis") return redisCmd(["DEL", key]);
  if (mode === "file") {
    const data = await readFileStore();
    delete data[key];
    return writeFileStore(data);
  }
  throw new Error(NOT_CONFIGURED);
}

// Sonni birga oshiradi va yangi qiymatni qaytaradi (ko'rishlar soni kabi hisoblagichlar uchun).
// Ulanmagan bo'lsa, jim tarzda 0 qaytaradi - sahifa yuklanishini bloklamaslik uchun.
export async function kvIncr(key: string): Promise<number> {
  const mode = kvMode();
  if (mode === "redis") {
    const cfg = redisConfig()!;
    const res = await fetch(`${cfg.url}/incr/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${cfg.token}` },
      cache: "no-store",
    });
    if (!res.ok) return 0;
    const json = (await res.json()) as { result: number };
    return json.result ?? 0;
  }
  if (mode === "file") {
    const data = await readFileStore();
    const next = (Number(data[key]) || 0) + 1;
    data[key] = String(next);
    await writeFileStore(data);
    return next;
  }
  return 0;
}
