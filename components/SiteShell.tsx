"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Ochiq saytda header/footer ko'rsatadi, admin panelda o'z dizayni bor, shuning uchun ularni yashiradi.
export default function SiteShell({
  header,
  footer,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return <>{children}</>;

  return (
    <>
      <a
        href="#asosiy"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-surface focus:px-3 focus:py-2"
      >
        Asosiy tarkibga o'tish
      </a>
      {header}
      <main id="asosiy" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
      {footer}
    </>
  );
}
