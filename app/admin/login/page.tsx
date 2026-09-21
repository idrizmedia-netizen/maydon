import type { Metadata } from "next";
import LogoMark from "@/components/LogoMark";
import LoginForm from "@/components/admin/LoginForm";
import { authConfigured } from "@/lib/auth";

export const metadata: Metadata = { title: "Kirish" };
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="mx-auto mt-8 max-w-sm sm:mt-16">
      <div className="mb-6 flex items-center gap-3">
        <LogoMark size={40} />
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Maydon admin</h1>
          <p className="text-sm text-muted">Maqola va yangiliklarni boshqarish</p>
        </div>
      </div>

      {!authConfigured() && (
        <p role="alert" className="mb-4 rounded border border-[#A16207] px-3 py-2 text-sm text-[#A16207]">
          AUTH_SECRET o'rnatilmagan, shuning uchun kirib bo'lmaydi. Vercel'da Settings, Environment Variables
          bo'limiga qo'shing.
        </p>
      )}

      <div className="rounded border border-line bg-surface p-5">
        <LoginForm />
      </div>
    </div>
  );
}
