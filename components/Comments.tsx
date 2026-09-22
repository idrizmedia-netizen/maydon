import { cookies } from "next/headers";
import Link from "next/link";
import { getComments } from "@/lib/comments";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { USER_SESSION_COOKIE, verifyUserSession } from "@/lib/user-auth";
import { addCommentAction, deleteCommentAction } from "@/app/yangilik/[slug]/comment-actions";

export default async function Comments({ slug }: { slug: string }) {
  const jar = await cookies();
  const comments = await getComments(slug);
  const userId = await verifyUserSession(jar.get(USER_SESSION_COOKIE)?.value);
  const isAdmin = await verifySession(jar.get(SESSION_COOKIE)?.value);

  return (
    <section className="mt-14 max-w-[68ch]" aria-labelledby="fikrlar">
      <h2 id="fikrlar" className="mb-4 border-b-[3px] border-hl pb-2 text-2xl font-extrabold tracking-tight">
        Fikrlar ({comments.length})
      </h2>

      {userId ? (
        <form action={addCommentAction} className="mb-8 space-y-2">
          <input type="hidden" name="slug" value={slug} />
          <textarea
            name="text"
            required
            rows={3}
            placeholder="Fikringizni yozing..."
            className="w-full rounded border border-line bg-bg px-3 py-2"
          />
          <button type="submit" className="rounded bg-ink px-4 py-2 text-sm font-bold text-white">
            Yuborish
          </button>
        </form>
      ) : (
        <p className="mb-8 text-sm text-muted">
          Fikr yozish uchun{" "}
          <Link href="/kirish" className="text-accent underline underline-offset-4">
            kiring
          </Link>{" "}
          yoki{" "}
          <Link href="/royxat" className="text-accent underline underline-offset-4">
            ro'yxatdan o'ting
          </Link>
          .
        </p>
      )}

      <ul className="space-y-5">
        {comments.map((c) => (
          <li key={c.id} className="flex gap-3">
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-line bg-surface">
              {c.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-muted">
                  {c.nickname[0]?.toUpperCase() ?? "?"}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-bold">{c.nickname}</span>
                <time className="text-muted">{new Date(c.createdAt).toLocaleDateString("uz-UZ")}</time>
                {isAdmin && (
                  <form action={deleteCommentAction} className="ml-auto">
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit" className="text-xs text-[#C93B3B] underline underline-offset-4">
                      O'chirish
                    </button>
                  </form>
                )}
              </div>
              <p className="mt-1 whitespace-pre-wrap text-[0.95rem]">{c.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
