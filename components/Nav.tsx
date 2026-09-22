"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { categories } from "@/lib/config";

export default function Nav() {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "Bosh sahifa", color: "var(--ink)", active: pathname === "/" },
    { href: "/oyinlar", label: "O'yinlar", color: "var(--ink)", active: pathname === "/oyinlar" },
    ...categories.map((c) => ({
      href: `/kategoriya/${c.slug}`,
      label: c.name,
      color: c.color,
      active: pathname === `/kategoriya/${c.slug}`,
    })),
    { href: "/video", label: "Video", color: "var(--ink)", active: pathname === "/video" },
    { href: "/photo", label: "Foto", color: "var(--ink)", active: pathname === "/photo" },
  ];

  return (
    <nav aria-label="Kategoriyalar" className="border-t border-line">
      <ul className="no-scrollbar mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6">
        {items.map((item) => (
          <li key={item.href} className="shrink-0">
            <Link
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={`block border-b-[3px] px-3 py-3 text-[0.95rem] font-semibold ${
                item.active ? "text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
              style={item.active ? { borderBottomColor: item.color } : undefined}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
