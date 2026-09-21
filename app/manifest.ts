import type { MetadataRoute } from "next";
import { categories, siteConfig } from "@/lib/config";

// Bu fayl brauzerga "Maydon" ilova sifatida o'rnatilishi mumkinligini aytadi.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name}: ${siteConfig.tagline}`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "uz",
    background_color: "#f2f5f8",
    theme_color: "#1B8A4B",
    categories: ["sports", "news"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: categories.slice(0, 4).map((c) => ({
      name: c.name,
      short_name: c.name,
      url: `/kategoriya/${c.slug}`,
      icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    })),
  };
}
