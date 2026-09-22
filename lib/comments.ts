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

export type UserCommentEntry = {
  slug: string;
  commentId: string;
  text: string;
  createdAt: number;
};

const commentsKey = (slug: string) => `comments:${slug}`;
const userCommentsKey = (userId: string) => `user-comments:${userId}`;

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

// Foydalanuvchi qaysi maqolalarga fikr yozgani - profil sahifasida ko'rsatish uchun.
export async function getUserComments(userId: string): Promise<UserCommentEntry[]> {
  const raw = await kvGet(userCommentsKey(userId), { fresh: true }).catch(() => null);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as UserCommentEntry[];
    return Array.isArray(arr) ? arr : [];
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

  const userList = await getUserComments(input.userId);
  userList.unshift({ slug, commentId: comment.id, text: comment.text, createdAt: comment.createdAt });
  await kvSet(userCommentsKey(input.userId), JSON.stringify(userList.slice(0, 200)));

  return comment;
}

export async function deleteComment(slug: string, id: string): Promise<void> {
  const list = await getComments(slug);
  const removed = list.find((c) => c.id === id);
  await kvSet(commentsKey(slug), JSON.stringify(list.filter((c) => c.id !== id)));

  if (removed) {
    const userList = await getUserComments(removed.userId);
    await kvSet(
      userCommentsKey(removed.userId),
      JSON.stringify(userList.filter((c) => c.commentId !== id))
    );
  }
}
