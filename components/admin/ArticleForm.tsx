"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { saveArticleAction, type FormState } from "@/app/admin/actions";
import { categories, kinds } from "@/lib/config";
import ImageUploader from "./ImageUploader";

export type FormInitial = {
  slug?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  kind?: string;
  author?: string;
  date?: string;
  tags?: string;
  image?: string;
  featured?: boolean;
  draft?: boolean;
  media?: string;
  videoUrl?: string;
};

const initialState: FormState = { error: null };
const inputCls = "w-full rounded border border-line bg-surface px-3 py-2.5 text-base";
const labelCls = "mb-1 block text-sm font-semibold";

export default function ArticleForm({ initial, today }: { initial: FormInitial; today: string }) {
  const [state, action, pending] = useActionState(saveArticleAction, initialState);
  const [image, setImage] = useState(initial.image ?? "");
  const [media, setMedia] = useState(initial.media ?? "none");
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Matn ichiga belgilar qo'yish (Markdown)
  function surround(before: string, after = "", placeholder = "") {
    const ta = contentRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const selected = value.slice(s, e) || placeholder;
    ta.value = value.slice(0, s) + before + selected + after + value.slice(e);
    ta.focus();
    ta.setSelectionRange(s + before.length, s + before.length + selected.length);
  }

  function insertAtCursor(snippet: string) {
    const ta = contentRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    ta.value = ta.value.slice(0, s) + snippet + ta.value.slice(ta.selectionEnd);
    ta.focus();
    ta.setSelectionRange(s + snippet.length, s + snippet.length);
  }

  const toolBtn = "rounded border border-line bg-surface px-2.5 py-1.5 text-sm font-semibold hover:bg-bg";

  return (
    <form action={action} className="space-y-6">
      {initial.slug && <input type="hidden" name="slug" value={initial.slug} />}
      <input type="hidden" name="image" value={image} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className={labelCls}>
            Sport bo'limi
          </label>
          <select id="category" name="category" required defaultValue={initial.category ?? ""} className={inputCls}>
            <option value="" disabled>
              Tanlang...
            </option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <fieldset>
          <legend className={labelCls}>Turi</legend>
          <div className="flex gap-5 pt-2">
            {kinds.map((k) => (
              <label key={k.value} className="flex items-center gap-2">
                <input type="radio" name="kind" value={k.value} defaultChecked={(initial.kind ?? "yangilik") === k.value} />
                {k.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div>
        <label htmlFor="title" className={labelCls}>
          Sarlavha
        </label>
        <input id="title" name="title" required maxLength={160} defaultValue={initial.title} className={inputCls} />
      </div>

      <div>
        <label htmlFor="excerpt" className={labelCls}>
          Qisqa mazmun
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          maxLength={300}
          defaultValue={initial.excerpt}
          placeholder="Bosh sahifada va Google'da ko'rinadigan 1-2 gap"
          className={inputCls}
        />
      </div>

      <div>
        <p className={labelCls}>Muqova rasmi</p>
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="Tanlangan muqova rasmi" className="mb-3 max-h-56 rounded border border-line" />
        )}
        <div className="flex flex-wrap items-start gap-3">
          <ImageUploader label={image ? "Rasmni almashtirish" : "Rasm yuklash"} onUploaded={setImage} />
          {image && (
            <button type="button" onClick={() => setImage("")} className="px-1 py-2 text-sm font-semibold text-[#C93B3B] underline underline-offset-4">
              Olib tashlash
            </button>
          )}
        </div>
      </div>

      <div className="rounded border border-line bg-surface p-4">
        <fieldset>
          <legend className={labelCls}>Bo'lim (Video / Foto)</legend>
          <p className="mb-2 text-sm text-muted">
            Belgilansa, maqola "Video" yoki "Foto" bo'limida ham chiqadi.
          </p>
          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2">
              <input type="radio" name="media" value="none" checked={media === "none"} onChange={() => setMedia("none")} />
              Oddiy maqola
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="media" value="video" checked={media === "video"} onChange={() => setMedia("video")} />
              Video
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="media" value="photo" checked={media === "photo"} onChange={() => setMedia("photo")} />
              Foto galereya
            </label>
          </div>
        </fieldset>
        {media === "video" && (
          <div className="mt-3">
            <label htmlFor="videoUrl" className={labelCls}>
              Video havolasi (YouTube va h.k.)
            </label>
            <input
              id="videoUrl"
              name="videoUrl"
              type="url"
              defaultValue={initial.videoUrl}
              placeholder="https://www.youtube.com/watch?v=..."
              className={inputCls}
            />
          </div>
        )}
        {media === "photo" && (
          <p className="mt-3 text-sm text-muted">
            Galereya uchun matn ichiga yuqoridagi "Matnga rasm qo'shish" tugmasi orqali bir nechta rasm joylashtiring.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="content" className={labelCls}>
          Matn
        </label>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <button type="button" className={toolBtn} onClick={() => surround("**", "**", "qalin matn")}>
            Qalin
          </button>
          <button type="button" className={toolBtn} onClick={() => surround("*", "*", "qiya matn")}>
            Qiya
          </button>
          <button type="button" className={toolBtn} onClick={() => surround("\n\n## ", "\n\n", "Sarlavha")}>
            Sarlavha
          </button>
          <button type="button" className={toolBtn} onClick={() => surround("\n- ", "", "ro'yxat elementi")}>
            Ro'yxat
          </button>
          <button type="button" className={toolBtn} onClick={() => surround("> ", "", "iqtibos")}>
            Iqtibos
          </button>
          <button type="button" className={toolBtn} onClick={() => surround("[", "](https://)", "havola matni")}>
            Havola
          </button>
          <ImageUploader label="Matnga rasm qo'shish" onUploaded={(url) => insertAtCursor(`\n\n![Rasm tavsifi](${url})\n\n`)} />
        </div>
        <textarea
          id="content"
          name="content"
          ref={contentRef}
          required
          rows={16}
          defaultValue={initial.content}
          className={`${inputCls} font-mono text-[0.95rem] leading-relaxed`}
        />
        <p className="mt-1 text-sm text-muted">Abzaslarni bo'sh qator bilan ajrating. Yuqoridagi tugmalar Markdown belgilarini o'zi qo'yadi.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="author" className={labelCls}>
            Muallif
          </label>
          <input id="author" name="author" maxLength={80} defaultValue={initial.author ?? "Tahririyat"} className={inputCls} />
        </div>
        <div>
          <label htmlFor="date" className={labelCls}>
            Sana
          </label>
          <input id="date" name="date" type="date" defaultValue={initial.date ?? today} className={inputCls} />
        </div>
        <div>
          <label htmlFor="tags" className={labelCls}>
            Teglar (vergul bilan)
          </label>
          <input id="tags" name="tags" defaultValue={initial.tags} placeholder="taktika, press" className={inputCls} />
        </div>
      </div>

      <div className="space-y-2 rounded border border-line bg-surface p-4">
        <label className="flex items-start gap-3">
          <input type="checkbox" name="featured" defaultChecked={initial.featured} className="mt-1" />
          <span>
            <span className="font-semibold">Bosh sahifada asosiy qilib ko'rsatish</span>
            <span className="block text-sm text-muted">Bir nechta bo'lsa, eng yangisi chiqadi.</span>
          </span>
        </label>
        <label className="flex items-start gap-3">
          <input type="checkbox" name="draft" defaultChecked={initial.draft} className="mt-1" />
          <span>
            <span className="font-semibold">Qoralama</span>
            <span className="block text-sm text-muted">Belgilansa, maqola saytda ko'rinmaydi.</span>
          </span>
        </label>
      </div>

      {state.error && (
        <p role="alert" className="rounded border border-[#C93B3B] px-3 py-2 text-[#C93B3B]">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className="rounded bg-ink px-6 py-3 font-bold text-bg disabled:opacity-60">
          {pending ? "Saqlanmoqda..." : "Saqlash"}
        </button>
        <Link href="/admin" className="font-semibold underline underline-offset-4">
          Bekor qilish
        </Link>
      </div>
    </form>
  );
}
