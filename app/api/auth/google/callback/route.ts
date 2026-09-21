import { NextResponse, type NextRequest } from "next/server";
import {
  GOOGLE_STATE_COOKIE,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  adminGoogleEmail,
  authConfigured,
  createSessionToken,
} from "@/lib/auth";

type GoogleIdToken = { email?: string; email_verified?: boolean };

function fail(req: NextRequest, reason: string) {
  const res = NextResponse.redirect(new URL(`/admin/login?xato=${reason}`, req.url));
  res.cookies.delete(GOOGLE_STATE_COOKIE);
  return res;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const savedState = req.cookies.get(GOOGLE_STATE_COOKIE)?.value;

  if (searchParams.get("error")) return fail(req, "google_bekor");
  if (!code || !state || !savedState || state !== savedState) return fail(req, "google_holat");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return fail(req, "google_sozlanmagan");
  if (!authConfigured()) return fail(req, "auth_sozlanmagan");

  const redirectUri = new URL("/api/auth/google/callback", req.url).toString();

  let idToken: string | undefined;
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
      cache: "no-store",
    });
    if (!tokenRes.ok) return fail(req, "google_token");
    const json = (await tokenRes.json()) as { id_token?: string };
    idToken = json.id_token;
  } catch {
    return fail(req, "google_token");
  }
  if (!idToken) return fail(req, "google_token");

  // id_token Google'ning /token so'rovidan to'g'ridan-to'g'ri (HTTPS orqali) olindi,
  // shuning uchun imzoni qayta tekshirish shart emas - faqat ma'lumot qismini o'qiymiz.
  let payload: GoogleIdToken;
  try {
    const part = idToken.split(".")[1];
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    payload = JSON.parse(json) as GoogleIdToken;
  } catch {
    return fail(req, "google_token");
  }

  const email = (payload.email ?? "").trim().toLowerCase();
  if (!email || payload.email_verified === false || email !== adminGoogleEmail()) {
    return fail(req, "google_ruxsat_yoq");
  }

  const token = await createSessionToken();
  if (!token) return fail(req, "auth_sozlanmagan");

  const res = NextResponse.redirect(new URL("/admin", req.url));
  res.cookies.delete(GOOGLE_STATE_COOKIE);
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
