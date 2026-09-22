import type { Metadata } from "next";
import Link from "next/link";
import RegisterForm from "@/components/RegisterForm";

export const metadata: Metadata = { title: "Ro'yxatdan o'tish" };

export default function RegisterPage() {
  return (
    <div className="mx-auto mt-4 max-w-sm">
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight">Ro'yxatdan o'tish</h1>
      <p className="mb-6 text-sm text-muted">
        Hisobingiz bormi?{" "}
        <Link href="/kirish" className="text-accent underline underline-offset-4">
          Kirish
        </Link>
      </p>
      <div className="rounded border border-line bg-surface p-5">
        <RegisterForm />
      </div>
    </div>
  );
}
