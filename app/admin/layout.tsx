import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import LogoMark from "@/components/LogoMark";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { logoutAction } from "./actions";

export const metadata: Metadata = {
  title: { default: "Admin panel", template: "%s | Maydon admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const loggedIn = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);

  return (
    <div className="min-h-screen">
      {loggedIn && (
        <header className="border-b border-line bg-surface">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <Link href="/admin" className="flex items-center gap-2.5 font-extrabold tracking-tight">
              <LogoMark size={28} />
              <span>
                Maydon <span className="font-medium text-muted">admin</span>
              </span>
            </Link>
            <nav aria-label="Admin menyu" className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-semibold">
              <Link href="/admin" className="hover:underline underline-offset-4">
                Maqolalar
              </Link>
              <Link href="/admin/yangi" className="hover:underline underline-offset-4">
                Yangi maqola
              </Link>
              <Link href="/admin/oyinlar" className="hover:underline underline-offset-4">
                Bugungi o'yinlar
              </Link>
              <Link href="/" target="_blank" className="hover:underline underline-offset-4">
                Saytni ko'rish
              </Link>
              <form action={logoutAction}>
                <button type="submit" className="text-[#C93B3B] hover:underline underline-offset-4">
                  Chiqish
                </button>
              </form>
            </nav>
          </div>
        </header>
      )}
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">{children}</div>
    </div>
  );
}
