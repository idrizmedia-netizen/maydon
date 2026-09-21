import Link from "next/link";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import { getAdminArticles } from "@/lib/articles";
import { categories, getCategory } from "@/lib/config";
import { formatDate } from "@/lib/format";
import { kvMode } from "@/lib/kv";
import { deleteArticleAction, toggleDraftAction } from "./actions";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ kategoriya?: string; ok?: string }> };

const NOTICES: Record<string, { text: string; error?: boolean }> = {
  saqlandi: { text: "Maqola saqlandi. Saytda bir necha soniyada ko'rinadi." },
  ochirildi: { text: "Maqola o'chirildi." },
  yangilandi: { text: "Holati o'zgartirildi." },
  xato: { text: "Amalni bajarib bo'lmadi. Baza ulanganini tekshiring.", error: true },
};

export default async function AdminDashboard({ searchParams }: Props) {
  const sp = await searchParams;
  const mode = kvMode();
  const all = await getAdminArticles();
  const filter = getCategory(sp.kategoriya ?? "")?.slug;
  const list = filter ? all.filter((a) => a.category === filter) : all;
  const notice = sp.ok ? NOTICES[sp.ok] : undefined;

  const count = (slug: string) => all.filter((a) => a.category === slug).length;
  const tabCls = (active: boolean) =>
    `rounded border px-3 py-1.5 text-sm font-semibold ${
      active ? "border-ink bg-ink text-bg" : "border-line bg-surface hover:bg-bg"
    }`;

  return (
    <div>
      {mode === "none" && (
        <div role="alert" className="mb-4 rounded border border-[#C93B3B] px-4 py-3 text-sm text-[#C93B3B]">
          <p className="font-bold">Ma'lumotlar bazasi ulanmagan.</p>
          <p className="mt-1">
            Maqolalarni ko'rish mumkin, lekin saqlab bo'lmaydi. Vercel'da Storage bo'limidan Upstash Redis ulang
            (README'ning 6-bo'limi).
          </p>
        </div>
      )}
      {mode === "file" && (
        <p className="mb-4 rounded border border-line bg-surface px-4 py-3 text-sm text-muted">
          Lokal rejim: maqolalar kompyuteringizdagi <code>.data/store.json</code> faylida saqlanmoqda.
        </p>
      )}

      {notice && (
        <p
          role="status"
          className={`mb-4 rounded border px-4 py-3 text-sm font-semibold ${
            notice.error ? "border-[#C93B3B] text-[#C93B3B]" : "border-[#1B8A4B] text-[#1B8A4B]"
          }`}
        >
          {notice.text}
        </p>
      )}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight">Maqolalar va yangiliklar</h1>
        <Link
          href={filter ? `/admin/yangi?kategoriya=${filter}` : "/admin/yangi"}
          className="rounded bg-ink px-4 py-2.5 font-bold text-bg"
        >
          {filter ? `Yangi ${getCategory(filter)?.name} maqolasi` : "Yangi maqola"}
        </Link>
      </div>

      <nav aria-label="Sport bo'limlari" className="mb-6 flex flex-wrap gap-2">
        <Link href="/admin" className={tabCls(!filter)}>
          Hammasi ({all.length})
        </Link>
        {categories.map((c) => (
          <Link key={c.slug} href={`/admin?kategoriya=${c.slug}`} className={tabCls(filter === c.slug)}>
            {c.name} ({count(c.slug)})
          </Link>
        ))}
      </nav>

      {list.length === 0 ? (
        <p className="rounded border border-line bg-surface p-6 text-muted">
          Bu bo'limda hali maqola yo'q. "Yangi maqola" tugmasini bosing.
        </p>
      ) : (
        <ul className="space-y-3">
          {list.map((a) => {
            const cat = getCategory(a.category);
            return (
              <li
                key={a.slug}
                className="rounded border border-line bg-surface p-4"
                style={{ borderLeft: `4px solid ${cat?.color ?? "#0E7C86"}` }}
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                  <span>{cat?.name}</span>
                  <span>{a.kind === "yangilik" ? "Yangilik" : "Maqola"}</span>
                  <time dateTime={a.date}>{formatDate(a.date)}</time>
                  {a.draft ? (
                    <span className="rounded bg-[#FBEBC8] px-2 py-0.5 font-semibold text-[#7A4B00] dark:bg-[#4A3510] dark:text-[#F5D48A]">
                      Qoralama
                    </span>
                  ) : (
                    <span className="rounded bg-[#DCF3E4] px-2 py-0.5 font-semibold text-[#14532D] dark:bg-[#123524] dark:text-[#A7E3BC]">
                      Chop etilgan
                    </span>
                  )}
                  {a.featured && <span className="font-semibold text-ink">Asosiy</span>}
                </div>
                <h2 className="mt-1 text-lg font-bold leading-snug">{a.title}</h2>

                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold">
                  <Link href={`/admin/${a.slug}`} className="underline underline-offset-4">
                    Tahrirlash
                  </Link>
                  {!a.draft && (
                    <Link href={`/yangilik/${a.slug}`} target="_blank" className="underline underline-offset-4">
                      Saytda ko'rish
                    </Link>
                  )}
                  <form action={toggleDraftAction}>
                    <input type="hidden" name="slug" value={a.slug} />
                    <button type="submit" className="underline underline-offset-4">
                      {a.draft ? "Chop etish" : "Qoralamaga o'tkazish"}
                    </button>
                  </form>
                  <form action={deleteArticleAction}>
                    <input type="hidden" name="slug" value={a.slug} />
                    <ConfirmSubmit
                      message={`"${a.title}" o'chirilsinmi? Buni qaytarib bo'lmaydi.`}
                      className="text-[#C93B3B] underline underline-offset-4"
                    >
                      O'chirish
                    </ConfirmSubmit>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
