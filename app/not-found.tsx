import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16">
      <h1 className="text-4xl font-extrabold tracking-tight">Sahifa topilmadi</h1>
      <p className="mt-3 max-w-md text-muted">
        Havola noto'g'ri yoki maqola o'chirilgan. Bosh sahifaga qaytib, kerakli maqolani qidiring.
      </p>
      <div className="mt-6 flex gap-4 font-semibold">
        <Link href="/" className="underline underline-offset-4">Bosh sahifa</Link>
        <Link href="/qidiruv" className="underline underline-offset-4">Qidiruv</Link>
      </div>
    </div>
  );
}
