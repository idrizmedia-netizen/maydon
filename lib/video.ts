// Odatiy video havolalarini (YouTube va h.k.) <iframe> uchun "embed" formatiga o'giradi.
// Aniqlab bo'lmasa, havolaning o'zini qaytaradi (ba'zi provayderlar to'g'ridan-to'g'ri iframe qo'llab-quvvatlaydi).

export function toEmbedUrl(url: string): string | null {
  const u = url.trim();
  if (!u) return null;

  try {
    const parsed = new URL(u);
    const host = parsed.hostname.replace(/^www\./, "");

    // youtube.com/watch?v=... yoki youtu.be/...
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      const shorts = parsed.pathname.match(/^\/shorts\/([\w-]+)/);
      if (shorts) return `https://www.youtube.com/embed/${shorts[1]}`;
    }
    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1);
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (host === "youtube.com" && parsed.pathname.startsWith("/embed/")) {
      return u;
    }

    // vimeo.com/12345
    if (host === "vimeo.com") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
    }

    // Boshqa manzillar - o'zini qaytaramiz, ko'p provayderlar to'g'ridan-to'g'ri iframe'ga chiqadi
    return u;
  } catch {
    return null;
  }
}
