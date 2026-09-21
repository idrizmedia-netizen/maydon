"use client";

import { useEffect } from "react";

// Service worker'ni ro'yxatdan o'tkazadi (ilova sifatida o'rnatish va oflayn sahifa uchun).
export default function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
