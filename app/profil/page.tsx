import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { USER_SESSION_COOKIE, verifyUserSession } from "@/lib/user-auth";
import { getUserById } from "@/lib/users";
import ProfileForm from "@/components/ProfileForm";
import PasswordForm from "@/components/PasswordForm";
import { userLogoutAction } from "./actions";

export const metadata: Metadata = { title: "Profil" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const userId = await verifyUserSession((await cookies()).get(USER_SESSION_COOKIE)?.value);
  if (!userId) redirect("/kirish");
  const user = await getUserById(userId);
  if (!user) redirect("/kirish");

  return (
    <div className="mx-auto mt-4 max-w-lg space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">Mening profilim</h1>
        <form action={userLogoutAction}>
          <button type="submit" className="text-sm font-semibold text-[#C93B3B] underline underline-offset-4">
            Chiqish
          </button>
        </form>
      </div>

      <section className="rounded border border-line bg-surface p-5">
        <h2 className="mb-4 font-bold">Profil ma'lumotlari</h2>
        <p className="mb-4 text-sm text-muted">Email: {user.email}</p>
        <ProfileForm nickname={user.nickname} avatar={user.avatar} />
      </section>

      <section className="rounded border border-line bg-surface p-5">
        <h2 className="mb-4 font-bold">Parolni almashtirish</h2>
        <PasswordForm />
      </section>
    </div>
  );
}
