// Maqolalarga yoziladigan fikrlar.

import { kvGet, kvSet } from "./kv";

export type Comment = {
  id: string;
  userId: string;
  nickname: string;
  avatar: string;
  text: string;
  createdAt: number;
};

const commentsKey = (slug: string) => `comments:${slug}`;

export async function getComments(slug: string): Promise<Comment[]> {
  const raw = await kvGet(commentsKey(slug), { fresh: true }).catch(() => null);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as Comment[];
    return Array.isArray(arr) ? arr.sort((a, b) => b.createdAt - a.createdAt) : [];
  } catch {
    return [];
  }
}

export async function addComment(
  slug: string,
  input: { userId: string; nickname: string; avatar: string; text: string }
): Promise<Comment> {
  const list = await getComments(slug);
  const comment: Comment = {
    id: crypto.randomUUID().replace(/-/g, "").slice(0, 12),
    ...input,
    text: input.text.trim().slice(0, 2000),
    createdAt: Date.now(),
  };
  list.unshift(comment);
  await kvSet(commentsKey(slug), JSON.stringify(list));
  return comment;
}

export async function deleteComment(slug: string, id: string): Promise<void> {
  const list = await getComments(slug);
  await kvSet(commentsKey(slug), JSON.stringify(list.filter((c) => c.id !== id)));
}
