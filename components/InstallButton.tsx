"use client";

import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// "Ilovani o'rnatish" tugmasi.
// Android/Chrome/Edge: brauzerning o'rnatish oynasini ochadi.
// iPhone/iPad: Safari o'rnatish oynasini ochib bo'lmaydi, shuning uchun qisqa yo'riqnoma ko'rsatadi.
export default function InstallButton() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  const [help, setHelp] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) {
      setInstalled(true);
      return;
    }

    const ua = navigator.userAgent;
    const isIos =
      /iphone|ipad|ipod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    setIos(isIos);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || (!prompt && !ios)) return null;

  async function onClick() {
    if (prompt) {
      await prompt.prompt();
      await prompt.userChoice;
      setPrompt(null);
    } else {
      setHelp((v) => !v);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        aria-expanded={prompt ? undefined : help}
        className="flex h-10 items-center gap-2 rounded px-2.5 text-sm font-semibold hover:bg-line"
        title="Maydon ilovasini o'rnatish"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
        </svg>
        <span className="hidden sm:inline">Ilovani o'rnatish</span>
        <span className="sr-only sm:hidden">Ilovani o'rnatish</span>
      </button>

      {help && (
        <div
          role="dialog"
          aria-label="iPhone uchun o'rnatish yo'riqnomasi"
          className="absolute right-0 top-12 z-50 w-64 rounded border border-line bg-surface p-4 text-sm leading-relaxed shadow-lg"
        >
          <p className="font-bold">iPhone yoki iPad'da</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Safari'da pastdagi «Ulashish» tugmasini bosing.</li>
            <li>«Bosh ekranga qo'shish» ni tanlang.</li>
            <li>«Qo'shish» ni bosing.</li>
          </ol>
          <button type="button" onClick={() => setHelp(false)} className="mt-3 font-semibold underline underline-offset-4">
            Yopish
          </button>
        </div>
      )}
    </div>
  );
}
