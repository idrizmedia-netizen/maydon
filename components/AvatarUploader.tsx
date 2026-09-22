"use client";

import { useRef, useState } from "react";

async function toCompressedDataUrl(file: File): Promise<string> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("Bu rasm formatini o'qib bo'lmadi. JPG, PNG yoki WebP yuklang.");
  }
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const scale = Math.max(size / bitmap.width, size / bitmap.height);
  const w = bitmap.width * scale;
  const h = bitmap.height * scale;
  ctx.drawImage(bitmap, (size - w) / 2, (size - h) / 2, w, h);
  for (const q of [0.85, 0.7, 0.55]) {
    const url = canvas.toDataURL("image/jpeg", q);
    if (url.length < 700_000) return url;
  }
  throw new Error("Rasm juda katta.");
}

export default function AvatarUploader({
  current,
  onUploaded,
}: {
  current: string;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(current);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const dataUrl = await toCompressedDataUrl(file);
      const res = await fetch("/api/user/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl }),
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Yuklashda xatolik");
      setPreview(json.url);
      onUploaded(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yuklashda xatolik");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="h-20 w-20 overflow-hidden rounded-full border border-line bg-bg">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl text-muted">?</div>
        )}
      </div>
      <div>
        <input ref={inputRef} type="file" accept="image/*" onChange={onChange} className="sr-only" tabIndex={-1} />
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="rounded border border-line bg-surface px-3 py-2 text-sm font-semibold hover:bg-bg disabled:opacity-60"
        >
          {busy ? "Yuklanmoqda..." : "Rasm yuklash"}
        </button>
        {error && (
          <p role="alert" className="mt-2 text-sm text-[#C93B3B]">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
