import Link from "next/link";
import { cookies } from "next/headers";
import InstallButton from "./InstallButton";
import LogoMark from "./LogoMark";
import Nav from "./Nav";
import ThemeToggle from "./ThemeToggle";
import { siteConfig } from "@/lib/config";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { USER_SESSION_COOKIE, verifyUserSession } from "@/lib/user-auth";
import { getPublicUser } from "@/lib/users";

export default async function Header() {
  const jar = await cookies();
  const isAdmin = await verifySession(jar.get(SESSION_COOKIE)?.value);
  const userId = await verifyUserSession(jar.get(USER_SESSION_COOKIE)?.value);
  const user = userId ? await getPublicUser(userId) : null;

  return (
    <header className="sticky top-0 z-40 bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${siteConfig.name}: bosh sahifa`}>
          <LogoMark size={32} />
          <span className="text-xl font-extrabold tracking-tight">{siteConfig.name}</span>
        </Link>

        <div className="flex items-center gap-1">
          {isAdmin && (
            <Link
              href="/admin"
              aria-label="Admin panel"
              title="Admin panel"
              className="flex h-10 w-10 items-center justify-center rounded hover:bg-line"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
              </svg>
            </Link>
          )}
          <InstallButton />
          <Link
            href="/qidiruv"
            aria-label="Qidiruv"
            title="Qidiruv"
            className="flex h-10 w-10 items-center justify-center rounded hover:bg-line"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </Link>
          <ThemeToggle />
          {user ? (
            <Link href="/profil" aria-label="Profil" title={user.nickname} className="ml-1 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-line bg-bg">
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-bold">{user.nickname[0]?.toUpperCase() ?? "?"}</span>
              )}
            </Link>
          ) : (
            <Link
              href="/kirish"
              className="ml-1 rounded border border-line px-3 py-1.5 text-sm font-semibold hover:bg-line"
            >
              Kirish
            </Link>
          )}
        </div>
      </div>
      <Nav />
      <div className="h-px w-full bg-line" />
    </header>
  );
}
