import { getAllArticles } from "@/lib/articles";
import { siteConfig } from "@/lib/config";

export const dynamic = "force-static";

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function GET() {
  const items = getAllArticles()
    .slice(0, 30)
    .map((a) => {
      const link = `${siteConfig.url}/yangilik/${a.slug}`;
      return `<item>
  <title>${esc(a.title)}</title>
  <link>${link}</link>
  <guid>${link}</guid>
  <pubDate>${new Date(a.date).toUTCString()}</pubDate>
  <description>${esc(a.excerpt)}</description>
</item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${esc(siteConfig.name)}</title>
  <link>${siteConfig.url}</link>
  <description>${esc(siteConfig.description)}</description>
  <language>uz</language>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
