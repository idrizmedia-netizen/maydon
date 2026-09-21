import type { Metadata } from "next";
import LogoMark from "@/components/LogoMark";
import { adminGoogleEmail, authConfigured, googleConfigured } from "@/lib/auth";

export const metadata: Metadata = { title: "Kirish" };
export const dynamic = "force-dynamic";

const GOOGLE_ERRORS: Record<string, string> = {
  google_sozlanmagan: "Google kirish hali sozlanmagan (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET yo'q).",
  google_holat: "Sessiya muddati tugadi, qayta urinib ko'ring.",
  google_token: "Google bilan bog'lanishda xatolik yuz berdi.",
  google_bekor: "Google orqali kirish bekor qilindi.",
  auth_sozlanmagan: "Serverda AUTH_SECRET sozlanmagan.",
  google_ruxsat_yoq: "Bu Google hisobiga admin panelga kirish ruxsati berilmagan.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ xato?: string }>;
}) {
  const { xato } = await searchParams;
  const googleError = xato ? GOOGLE_ERRORS[xato] ?? "Xatolik yuz berdi." : null;

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

      {googleError && (
        <p role="alert" className="mb-4 rounded border border-[#C93B3B] px-3 py-2 text-sm text-[#C93B3B]">
          {googleError}
        </p>
      )}

      <div className="rounded border border-line bg-surface p-5">
        {googleConfigured() ? (
          <a
            href="/api/auth/google"
            className="flex w-full items-center justify-center gap-2 rounded border border-line bg-bg px-4 py-3 font-bold hover:bg-surface"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18Z"
              />
              <path
                fill="#FBBC05"
                d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03l2.97-2.33Z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
              />
            </svg>
            Google bilan kirish
          </a>
        ) : (
          <p role="alert" className="rounded border border-[#C93B3B] px-3 py-2 text-sm text-[#C93B3B]">
            Google bilan kirish hali sozlanmagan. Vercel'da GOOGLE_CLIENT_ID va GOOGLE_CLIENT_SECRET'ni
            qo'shing ({adminGoogleEmail()} uchun), so'ng qayta deploy qiling.
          </p>
        )}
      </div>
    </div>
  );
}
