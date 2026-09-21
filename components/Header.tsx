import Link from "next/link";
import InstallButton from "./InstallButton";
import LogoMark from "./LogoMark";
import Nav from "./Nav";
import ThemeToggle from "./ThemeToggle";
import { siteConfig } from "@/lib/config";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${siteConfig.name}: bosh sahifa`}>
          <LogoMark size={32} />
          <span className="text-xl font-extrabold tracking-tight">{siteConfig.name}</span>
        </Link>

        <div className="flex items-center gap-1">
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
        </div>
      </div>
      <Nav />
      <div className="h-px w-full bg-line" />
    </header>
  );
}
