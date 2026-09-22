import Link from "next/link";

type Entry = { slug: string; commentId: string; text: string; createdAt: number; title: string };

export default function MyComments({ comments }: { comments: Entry[] }) {
  if (comments.length === 0) {
    return <p className="text-sm text-muted">Siz hali hech qanday maqolaga fikr bildirmagansiz.</p>;
  }

  return (
    <ul className="space-y-4">
      {comments.map((c) => (
        <li key={c.commentId} className="border-b border-line pb-3 last:border-0 last:pb-0">
          <Link href={`/yangilik/${c.slug}#fikrlar`} className="text-sm font-bold underline underline-offset-4">
            {c.title}
          </Link>
          <p className="mt-1 line-clamp-2 text-sm text-muted">{c.text}</p>
          <time className="mt-1 block text-xs text-muted">{new Date(c.createdAt).toLocaleDateString("uz-UZ")}</time>
        </li>
      ))}
    </ul>
  );
}
