import { NextResponse, type NextRequest } from "next/server";
import { GOOGLE_STATE_COOKIE, googleConfigured } from "@/lib/auth";

// Bu yo'l middleware'dagi /api/admin himoyasidan tashqarida - hali kirmagan
// foydalanuvchi ham shu yerga kelib, Google orqali kirishni boshlaydi.

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!googleConfigured() || !clientId) {
    return NextResponse.redirect(new URL("/admin/login?xato=google_sozlanmagan", req.url));
  }

  const state = crypto.randomUUID();
  const redirectUri = new URL("/api/auth/google/callback", req.url).toString();

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("prompt", "select_account");

  const res = NextResponse.redirect(authUrl);
  res.cookies.set(GOOGLE_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 300, // 5 daqiqa
  });
  return res;
}
