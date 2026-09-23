// "Bugungi o'yinlar" - admin qo'lda kiritadigan o'yin natijalari. Har kun uchun alohida ro'yxat.

import { kvGet, kvSet } from "./kv";
import { todayTashkent } from "./format";

export type GameStatus = "rejalashtirilgan" | "jonli" | "tugadi";

export type Game = {
  id: string;
  category: string; // lib/config.ts'dagi categories.slug
  team1: string;
  team2: string;
  score1: number | null;
  score2: number | null;
  time: string; // masalan "18:00", bo'sh bo'lishi mumkin
  status: GameStatus;
  league?: string; // masalan "Premier Liga", "Chempionlar Ligasi" - avtomatik yuklashda to'ldiriladi
};

const gamesKey = (date: string) => `games:${date}`;

export async function getGames(date: string = todayTashkent()): Promise<Game[]> {
  const raw = await kvGet(gamesKey(date), { fresh: true }).catch(() => null);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as Game[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function saveGames(games: Game[], date: string) {
  await kvSet(gamesKey(date), JSON.stringify(games));
}

export async function addGame(input: Omit<Game, "id">, date: string = todayTashkent()): Promise<Game> {
  const games = await getGames(date);
  const game: Game = { ...input, id: crypto.randomUUID().replace(/-/g, "").slice(0, 8) };
  games.push(game);
  await saveGames(games, date);
  return game;
}

export async function updateGame(
  id: string,
  patch: Partial<Omit<Game, "id">>,
  date: string = todayTashkent()
): Promise<void> {
  const games = await getGames(date);
  const idx = games.findIndex((g) => g.id === id);
  if (idx === -1) return;
  games[idx] = { ...games[idx], ...patch };
  await saveGames(games, date);
}

export async function deleteGame(id: string, date: string = todayTashkent()): Promise<void> {
  const games = await getGames(date);
  await saveGames(
    games.filter((g) => g.id !== id),
    date
  );
}
