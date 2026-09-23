import type { ReactElement } from "react";
import Link from "next/link";
import { categories, siteConfig } from "@/lib/config";

const SOCIAL_ICONS: Record<string, ReactElement> = {
  telegram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.9 3.6 2.7 11.2c-1.3.5-1.3 1.2-.2 1.5l4.9 1.5 1.9 5.8c.2.6.4.9.9.9.4 0 .6-.2.9-.5l2.2-2.1 4.6 3.4c.8.5 1.4.2 1.6-.7l3-14c.3-1.2-.4-1.7-1.6-1.4Zm-3.4 3.5-6.6 6c-.2.2-.3.4-.4.7l-.3 2.5-1.3-4.2 8-6.4c.4-.3.7 0 .4.4Z" />
    </svg>
  ),
  instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  facebook: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.2-1.5 1.5-1.5h1.7V3.7C15.9 3.6 15 3.5 13.9 3.5c-2.2 0-3.8 1.4-3.8 3.9v2.5H7.4V13h2.7v8h3.4Z" />
    </svg>
  ),
  x: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.9 2.6h3.2l-7 8 8.2 10.8h-6.4l-5-6.6-5.8 6.6H2l7.5-8.6L1.6 2.6H8.2l4.5 6 6.2-6Zm-1.1 17h1.8L7.3 4.4H5.4L17.8 19.6Z" />
    </svg>
  ),
  youtube: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12s0-3.3-.4-4.9c-.3-.9-1-1.6-1.9-1.9C18 5 12 5 12 5s-6 0-7.7.2c-.9.3-1.6 1-1.9 1.9C2 8.7 2 12 2 12s0 3.3.4 4.9c.3.9 1 1.6 1.9 1.9C6 19 12 19 12 19s6 0 7.7-.2c.9-.3 1.6-1 1.9-1.9.4-1.6.4-4.9.4-4.9ZM10 15.3V8.7l5.8 3.3-5.8 3.3Z" />
    </svg>
  ),
};

const SOCIAL_LABELS: Record<string, string> = {
  telegram: "Telegram",
  instagram: "Instagram",
  facebook: "Facebook",
  x: "X (Twitter)",
  youtube: "YouTube",
};

export default function Footer() {
  const socialLinks = Object.entries(siteConfig.social).filter(([, url]) => url);

  return (
    <footer className="mt-12 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="text-lg font-extrabold tracking-tight">{siteConfig.name}</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{siteConfig.description}</p>
          {socialLinks.length > 0 && (
            <div className="mt-4 flex gap-2">
              {socialLinks.map(([key, url]) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={SOCIAL_LABELS[key]}
                  title={SOCIAL_LABELS[key]}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink hover:bg-bg"
                >
                  {SOCIAL_ICONS[key]}
                </a>
              ))}
            </div>
          )}
        </div>

        <nav aria-label="Kategoriyalar (pastki)">
          <p className="text-sm font-semibold text-muted">Kategoriyalar</p>
          <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/kategoriya/${c.slug}`} className="hover:underline">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Sahifalar (pastki)">
          <p className="text-sm font-semibold text-muted">Sahifalar</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            <li>
              <Link href="/oyinlar" className="hover:underline">
                O'yinlar markazi
              </Link>
            </li>
            <li>
              <Link href="/video" className="hover:underline">
                Video
              </Link>
            </li>
            <li>
              <Link href="/photo" className="hover:underline">
                Foto
              </Link>
            </li>
            <li>
              <Link href="/qidiruv" className="hover:underline">
                Qidiruv
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-line py-4 text-center text-sm text-muted">
        © {new Date().getFullYear()} {siteConfig.name}
      </div>
    </footer>
  );
}
