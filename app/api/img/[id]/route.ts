import { kvGet } from "@/lib/kv";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-z0-9]{8,32}$/.test(id)) return new Response("Topilmadi", { status: 404 });

  const raw = await kvGet(`img:${id}`, { fresh: true });
  if (!raw) return new Response("Topilmadi", { status: 404 });

  try {
    const { type, data } = JSON.parse(raw) as { type: string; data: string };
    return new Response(Buffer.from(data, "base64"), {
      headers: {
        "Content-Type": `image/${type}`,
        // Rasm manzili har safar yangi bo'ladi, shuning uchun uzoq keshlash xavfsiz
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Topilmadi", { status: 404 });
  }
}
