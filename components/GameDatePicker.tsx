"use client";

import { useRouter } from "next/navigation";

// Kalendar orqali istalgan sanaga o'tish uchun (Kecha/Bugun/Ertaga tablaridan tashqari).
export default function GameDatePicker({ date, basePath }: { date: string; basePath: string }) {
  const router = useRouter();

  return (
    <label className="inline-flex items-center gap-1.5 rounded border border-line bg-bg px-2.5 py-1.5 text-sm font-semibold text-muted hover:text-ink">
      <span aria-hidden="true">📅</span>
      <span className="sr-only">Sanani tanlang</span>
      <input
        type="date"
        value={date}
        onChange={(e) => {
          if (e.target.value) router.push(`${basePath}?kun=${e.target.value}`);
        }}
        className="bg-transparent text-sm font-semibold outline-none [color-scheme:light_dark]"
      />
    </label>
  );
}
