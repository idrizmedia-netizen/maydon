import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

// /admin va /api/admin faqat tizimga kirgan admin uchun
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ok = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);

  if (pathname.startsWith("/api/admin")) {
    if (!ok) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    if (ok) return NextResponse.redirect(new URL("/admin", req.url));
    return NextResponse.next();
  }

  if (!ok) return NextResponse.redirect(new URL("/admin/login", req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
