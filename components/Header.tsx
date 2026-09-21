import Link from "next/link";
import Nav from "./Nav";
import ThemeToggle from "./ThemeToggle";
import { siteConfig } from "@/lib/config";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${siteConfig.name}: bosh sahifa`}>
          <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
            <rect width="30" height="30" rx="6" fill="#1B8A4B" />
            <line x1="15" y1="0" x2="15" y2="30" stroke="#fff" strokeOpacity=".55" strokeWidth="1.5" />
            <circle cx="15" cy="15" r="6" fill="none" stroke="#fff" strokeOpacity=".9" strokeWidth="1.5" />
          </svg>
          <span className="text-xl font-extrabold tracking-tight">{siteConfig.name}</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/qidiruv"
            aria-label="Qidiruv"
            title="Qidiruv"
            className="flex h-10 w-10 items-center justify-center rounded hover:bg-line/60"
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
