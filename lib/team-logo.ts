// Jamoa logotiplarini avtomatik topish - TheSportsDB (bepul, ochiq) API orqali.
// https://www.thesportsdb.com - "3" bu ommaviy sinov kaliti, taxminan daqiqasiga
// 30 so'rovga cheklangan, shuning uchun natijalarni ombor (KV)da uzoq muddat keshlaymiz.
//
// Diqqat: TheSportsDB asosan futbol va yirik xalqaro sport turlarini qamrab oladi.
// Milliy kurash kabi mahalliy sport turlaridagi jamoalar/sportchilar uchun
// logotip odatda topilmaydi - bu holda funksiya shunchaki null qaytaradi va
// interfeys jamoa nomini logotipsiz ko'rsatadi (xato bermaydi).

import { kvGet, kvSet } from "./kv";

const API = "https://www.thesportsdb.com/api/v1/json/3/searchteams.php";
const CACHE_PREFIX = "team-logo:";
const NOT_FOUND = "__YOQ__"; // topilmagan nomlarni ham keshlab, har safar qayta so'ramaslik uchun
const CACHE_DAYS = 30;

function cacheKey(name: string) {
  return CACHE_PREFIX + name.trim().toLowerCase();
}

type SearchTeamsResponse = {
  teams: { strTeamBadge?: string | null }[] | null;
};

async function fetchLogo(name: string): Promise<string | null> {
  try {
    const res = await fetch(`${API}?t=${encodeURIComponent(name)}`, {
      next: { revalidate: 60 * 60 * 24 * CACHE_DAYS },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as SearchTeamsResponse;
    const badge = data.teams?.[0]?.strTeamBadge;
    return badge ? badge : null;
  } catch {
    return null;
  }
}

// Bitta jamoa nomi uchun logotip manzilini qaytaradi (topilmasa - null).
export async function getTeamLogo(name: string): Promise<string | null> {
  const team = name.trim();
  if (!team) return null;

  const key = cacheKey(team);
  const cached = await kvGet(key).catch(() => null);
  if (cached !== null) return cached === NOT_FOUND ? null : cached;

  const logo = await fetchLogo(team);
  // Kesh yozish muvaffaqiyatsiz bo'lsa ham (masalan, baza ulanmagan bo'lsa) sahifa buzilmasin.
  await kvSet(key, logo ?? NOT_FOUND).catch(() => {});
  return logo;
}

// Bir nechta jamoa nomi uchun logotiplarni bir vaqtda topadi: { "Pakhtakor": "https://...", "Nasaf": null }
export async function getTeamLogos(names: string[]): Promise<Record<string, string | null>> {
  const unique = Array.from(new Set(names.map((n) => n.trim()).filter(Boolean)));
  const entries = await Promise.all(unique.map(async (n) => [n, await getTeamLogo(n)] as const));
  return Object.fromEntries(entries);
}
