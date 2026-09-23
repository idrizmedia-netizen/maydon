import { ImageResponse } from "next/og";
import { getArticle } from "@/lib/articles";
import { getCategory, siteConfig } from "@/lib/config";

export const alt = "Maydon";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);
  const cat = article ? getCategory(article.category) : undefined;
  const color = cat?.color ?? "#1B8A4B";
  const title = article?.title ?? siteConfig.name;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 64,
          background: `linear-gradient(160deg, ${color} 0%, #0f1b2d 78%)`,
          fontFamily: "sans-serif",
        }}
      >
        {cat && (
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              background: "#ffffff",
              color: "#0f1b2d",
              fontSize: 28,
              fontWeight: 700,
              padding: "8px 20px",
              borderRadius: 6,
              marginBottom: 28,
            }}
          >
            {cat.name}
          </div>
        )}
        <div
          style={{
            display: "flex",
            color: "#ffffff",
            fontSize: title.length > 70 ? 48 : 60,
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: -1,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 36,
            color: "rgba(255,255,255,0.85)",
            fontSize: 30,
            fontWeight: 700,
          }}
        >
          {siteConfig.name}
        </div>
      </div>
    ),
    { ...size }
  );
}
