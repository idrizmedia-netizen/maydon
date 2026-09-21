"use client";

import { useRef, useState } from "react";

// Rasmni brauzerning o'zida kichraytirib (eng uzun tomoni 1400px, JPEG), keyin yuklaydi.
async function toCompressedDataUrl(file: File): Promise<string> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("Bu rasm formatini o'qib bo'lmadi. JPG, PNG yoki WebP yuklang.");
  }

  let scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
  for (let attempt = 0; attempt < 5; attempt++) {
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);
    for (const q of [0.85, 0.75, 0.65, 0.55]) {
      const url = canvas.toDataURL("image/jpeg", q);
      if (url.length < 700_000) return url;
    }
    scale *= 0.8;
  }
  throw new Error("Rasm juda katta. Kichikroq rasm tanlang.");
}

export default function ImageUploader({
  onUploaded,
  label,
}: {
  onUploaded: (url: string) => void;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const dataUrl = await toCompressedDataUrl(file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl }),
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Yuklashda xatolik");
      onUploaded(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yuklashda xatolik");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" onChange={onChange} className="sr-only" tabIndex={-1} />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="rounded border border-line bg-surface px-3 py-2 text-sm font-semibold hover:bg-bg disabled:opacity-60"
      >
        {busy ? "Yuklanmoqda..." : label}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-[#C93B3B]">
          {error}
        </p>
      )}
    </div>
  );
}
