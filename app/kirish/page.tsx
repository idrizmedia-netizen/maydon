import type { Metadata } from "next";
import Link from "next/link";
import UserLoginForm from "@/components/UserLoginForm";

export const metadata: Metadata = { title: "Kirish" };

export default function UserLoginPage() {
  return (
    <div className="mx-auto mt-4 max-w-sm">
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight">Kirish</h1>
      <p className="mb-6 text-sm text-muted">
        Hisobingiz yo'qmi?{" "}
        <Link href="/royxat" className="text-accent underline underline-offset-4">
          Ro'yxatdan o'ting
        </Link>
      </p>
      <div className="rounded border border-line bg-surface p-5">
        <UserLoginForm />
      </div>
    </div>
  );
}
