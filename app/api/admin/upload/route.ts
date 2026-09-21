import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { kvSet, NOT_CONFIGURED } from "@/lib/kv";

const MAX_DATA_URL = 900_000; // taxminan 650 KB rasm

export async function POST(req: Request) {
  // middleware'dan tashqari, bu yerda ham tekshiramiz
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!(await verifySession(token))) {
    return Response.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  let dataUrl = "";
  try {
    const body = (await req.json()) as { dataUrl?: unknown };
    dataUrl = String(body.dataUrl ?? "");
  } catch {
    return Response.json({ error: "So'rov noto'g'ri" }, { status: 400 });
  }

  if (dataUrl.length > MAX_DATA_URL) {
    return Response.json({ error: "Rasm juda katta" }, { status: 413 });
  }
  const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl);
  if (!match) {
    return Response.json({ error: "Faqat JPG, PNG yoki WebP rasm mumkin" }, { status: 400 });
  }

  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  try {
    await kvSet(`img:${id}`, JSON.stringify({ type: match[1], data: match[2] }));
  } catch (e) {
    const msg =
      e instanceof Error && e.message === NOT_CONFIGURED
        ? "Ma'lumotlar bazasi ulanmagan"
        : "Rasmni saqlab bo'lmadi";
    return Response.json({ error: msg }, { status: 500 });
  }
  return Response.json({ url: `/api/img/${id}` });
}
