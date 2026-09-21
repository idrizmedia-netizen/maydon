// Admin panelga kirish. Web Crypto ishlatadi, shuning uchun middleware (edge) va serverda ishlaydi.
//
// Faqat Google orqali kirish qo'llab-quvvatlanadi (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET),
// va faqat ADMIN_GOOGLE_EMAIL'dagi email'ga ruxsat beriladi.
// Sessiya cookie'sini imzolash uchun AUTH_SECRET kerak (production'da majburiy).

export const SESSION_COOKIE = "maydon_admin";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 kun
export const GOOGLE_STATE_COOKIE = "maydon_g_state"; // Google OAuth'dagi CSRF himoyasi uchun vaqtinchalik cookie

const enc = new TextEncoder();

// Google orqali kirishga ruxsat berilgan yagona email.
// ADMIN_GOOGLE_EMAIL o'rnatilmasa, standart qiymat ishlatiladi.
const DEFAULT_GOOGLE_EMAIL = "idrizmedia@gmail.com";

export function adminGoogleEmail(): string {
  return (process.env.ADMIN_GOOGLE_EMAIL ?? DEFAULT_GOOGLE_EMAIL).trim().toLowerCase();
}

export function googleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function signingKey(): string | null {
  const s = process.env.AUTH_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV !== "production") return "maydon-dev-secret-faqat-lokal-uchun";
  return null;
}

export function authConfigured() {
  return signingKey() !== null;
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

// Token: "<tugash vaqti>.<imzo>". Imzo kaliti ruxsat berilgan email'ga bog'liq,
// ADMIN_GOOGLE_EMAIL o'zgarsa eski sessiyalar avtomatik bekor bo'ladi.
export async function createSessionToken(): Promise<string | null> {
  const key = signingKey();
  if (!key) return null;
  const payload = String(Date.now() + SESSION_MAX_AGE * 1000);
  const sig = await hmac(payload, `${key}:${adminGoogleEmail()}`);
  return `${payload}.${sig}`;
}

export async function verifySession(token?: string | null): Promise<boolean> {
  if (!token) return false;
  const key = signingKey();
  if (!key) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const exp = Number(payload);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const expected = await hmac(payload, `${key}:${adminGoogleEmail()}`);
  return equalStrings(sig, expected);
}
