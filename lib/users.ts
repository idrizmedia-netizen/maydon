// Oddiy foydalanuvchilar (ro'yxatdan o'tib fikr yozadiganlar). Admin (Google) bilan aloqasi yo'q.

import { kvGet, kvSet } from "./kv";

export type StoredUser = {
  id: string;
  email: string;
  nickname: string;
  avatar: string; // "" yoki /api/img/<id>
  passwordHash: string; // hex
  salt: string; // hex
  createdAt: number;
};

export type PublicUser = Omit<StoredUser, "passwordHash" | "salt">;

const userKey = (id: string) => `user:${id}`;
const emailKey = (email: string) => `user-email:${email.trim().toLowerCase()}`;

function toPublic(u: StoredUser): PublicUser {
  const { passwordHash, salt, ...rest } = u;
  return rest;
}

async function hashPassword(password: string, saltHex?: string): Promise<{ hash: string; salt: string }> {
  const salt = saltHex ?? crypto.getRandomValues(new Uint8Array(16)).reduce((s, b) => s + b.toString(16).padStart(2, "0"), "");
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const saltBytes = new Uint8Array(salt.match(/.{2}/g)!.map((b) => parseInt(b, 16)));
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBytes, iterations: 100_000, hash: "SHA-256" },
    keyMaterial,
    256
  );
  const hash = Array.from(new Uint8Array(bits))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return { hash, salt };
}

function equalStrings(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function getUserById(id: string): Promise<StoredUser | null> {
  const raw = await kvGet(userKey(id), { fresh: true }).catch(() => null);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export async function getPublicUser(id: string): Promise<PublicUser | null> {
  const u = await getUserById(id);
  return u ? toPublic(u) : null;
}

export async function getUserByEmail(email: string): Promise<StoredUser | null> {
  const id = await kvGet(emailKey(email), { fresh: true }).catch(() => null);
  if (!id) return null;
  return getUserById(id);
}

export async function createUser(email: string, password: string, nickname: string): Promise<StoredUser> {
  const existing = await getUserByEmail(email);
  if (existing) throw new Error("EMAIL_BAND");

  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  const { hash, salt } = await hashPassword(password);
  const user: StoredUser = {
    id,
    email: email.trim().toLowerCase(),
    nickname: nickname.trim().slice(0, 40) || "Foydalanuvchi",
    avatar: "",
    passwordHash: hash,
    salt,
    createdAt: Date.now(),
  };
  await kvSet(userKey(id), JSON.stringify(user));
  await kvSet(emailKey(user.email), id);
  return user;
}

export async function verifyPassword(user: StoredUser, password: string): Promise<boolean> {
  const { hash } = await hashPassword(password, user.salt);
  return equalStrings(hash, user.passwordHash);
}

export async function updateUserProfile(id: string, patch: { nickname?: string; avatar?: string }): Promise<void> {
  const u = await getUserById(id);
  if (!u) return;
  const next: StoredUser = {
    ...u,
    nickname: patch.nickname !== undefined ? patch.nickname.trim().slice(0, 40) || u.nickname : u.nickname,
    avatar: patch.avatar !== undefined ? patch.avatar : u.avatar,
  };
  await kvSet(userKey(id), JSON.stringify(next));
}

export async function changePassword(id: string, newPassword: string): Promise<void> {
  const u = await getUserById(id);
  if (!u) return;
  const { hash, salt } = await hashPassword(newPassword);
  await kvSet(userKey(id), JSON.stringify({ ...u, passwordHash: hash, salt }));
}
