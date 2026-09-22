import Link from "next/link";
import { categories, siteConfig } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6">
        <div>
          <p className="text-lg font-extrabold tracking-tight">{siteConfig.name}</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{siteConfig.description}</p>
          <div className="mt-4 flex gap-4 text-sm font-semibold">
            {siteConfig.telegram && (
              <a href={siteConfig.telegram} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                Telegram kanal
              </a>
            )}
          </div>
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
      </div>
      <div className="border-t border-line py-4 text-center text-sm text-muted">
        © {new Date().getFullYear()} {siteConfig.name}
      </div>
    </footer>
  );
}
