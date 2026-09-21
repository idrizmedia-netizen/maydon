// Admin panelga kirish. Web Crypto ishlatadi, shuning uchun middleware (edge) va serverda ishlaydi.
//
// Login va parol Vercel'dagi ADMIN_LOGIN va ADMIN_PASSWORD o'zgaruvchilaridan olinadi.
// Ular berilmasa, VAQTINCHALIK qiymatlar ishlaydi: Izzat / 123456.
// Sessiya cookie'sini imzolash uchun AUTH_SECRET kerak (production'da majburiy).

export const SESSION_COOKIE = "maydon_admin";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 kun

const enc = new TextEncoder();

const DEFAULT_LOGIN = "Izzat";
const DEFAULT_PASSWORD = "123456";

function adminLogin() {
  return (process.env.ADMIN_LOGIN ?? DEFAULT_LOGIN).trim();
}
function adminPassword() {
  return process.env.ADMIN_PASSWORD ?? DEFAULT_PASSWORD;
}

// Vaqtinchalik login/parol hali almashtirilmagan bo'lsa true
export function usingDefaultCredentials() {
  return !process.env.ADMIN_LOGIN || !process.env.ADMIN_PASSWORD;
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

async function sha(s: string) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(s)));
}

function equalBytes(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

function equalStrings(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function checkCredentials(login: string, password: string) {
  const [l1, l2, p1, p2] = await Promise.all([
    sha(login.trim().toLowerCase()),
    sha(adminLogin().toLowerCase()),
    sha(password),
    sha(adminPassword()),
  ]);
  const loginOk = equalBytes(l1, l2);
  const passOk = equalBytes(p1, p2);
  return loginOk && passOk;
}

// Token: "<tugash vaqti>.<imzo>". Imzo kaliti parolga bog'liq, parol o'zgarsa eski sessiyalar bekor bo'ladi.
export async function createSessionToken(): Promise<string | null> {
  const key = signingKey();
  if (!key) return null;
  const payload = String(Date.now() + SESSION_MAX_AGE * 1000);
  const sig = await hmac(payload, `${key}:${adminPassword()}`);
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
  const expected = await hmac(payload, `${key}:${adminPassword()}`);
  return equalStrings(sig, expected);
}
