// Oddiy foydalanuvchilar uchun sessiya. Admin sessiyasidan (lib/auth.ts) butunlay alohida cookie.

export const USER_SESSION_COOKIE = "maydon_user";
export const USER_SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 kun

const enc = new TextEncoder();

function signingKey(): string | null {
  const s = process.env.AUTH_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV !== "production") return "maydon-dev-secret-faqat-lokal-uchun";
  return null;
}

function toHex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(data: string, key: string) {
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toHex(await crypto.subtle.sign("HMAC", k, enc.encode(data)));
}

function equalStrings(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Token: "<userId>.<tugash vaqti>.<imzo>"
export async function createUserSessionToken(userId: string): Promise<string | null> {
  const key = signingKey();
  if (!key) return null;
  const payload = `${userId}.${Date.now() + USER_SESSION_MAX_AGE * 1000}`;
  const sig = await hmac(payload, key);
  return `${payload}.${sig}`;
}

export async function verifyUserSession(token?: string | null): Promise<string | null> {
  if (!token) return null;
  const key = signingKey();
  if (!key) return null;
  const [userId, exp, sig] = token.split(".");
  if (!userId || !exp || !sig) return null;
  if (!Number.isFinite(Number(exp)) || Number(exp) < Date.now()) return null;
  const expected = await hmac(`${userId}.${exp}`, key);
  return equalStrings(sig, expected) ? userId : null;
}
