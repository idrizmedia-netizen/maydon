"use client";

import { useMemo, useState } from "react";
import ArticleCard from "./ArticleCard";

type Item = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  tags: string[];
};

// o', g' kabi harflardagi turli apostroflarni bir xil qiladi
function normalize(s: string) {
  return s.toLowerCase().replace(/[ʻʼ’‘`´']/g, "").trim();
}

export default function SearchClient({ items }: { items: Item[] }) {
  const [query, setQuery] = useState("");
  const q = normalize(query);

  const results = useMemo(() => {
    if (!q) return [];
    const words = q.split(/\s+/);
    return items.filter((a) => {
      const hay = normalize(`${a.title} ${a.excerpt} ${a.tags.join(" ")}`);
      return words.every((w) => hay.includes(w));
    });
  }, [q, items]);

  const shown = q ? results : items.slice(0, 6);

  return (
    <div>
      <label htmlFor="q" className="sr-only">
        Maqola qidirish
      </label>
      <input
        id="q"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Masalan: futbol, ofsayd, yugurish"
        autoComplete="off"
        className="w-full rounded border border-line bg-surface px-4 py-3 text-lg placeholder:text-muted"
      />

      <p className="mt-4 text-sm text-muted" aria-live="polite">
        {q ? `${results.length} ta natija topildi` : "So'nggi maqolalar"}
      </p>

      {q && results.length === 0 ? (
        <div className="mt-4 rounded border border-line bg-surface p-6">
          <p className="font-semibold">“{query}” bo'yicha hech narsa topilmadi.</p>
          <p className="mt-1 text-muted">Boshqa so'z yozib ko'ring yoki kategoriyalardan birini tanlang.</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
