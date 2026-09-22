"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserByEmail, verifyPassword } from "@/lib/users";
import { createUserSessionToken, USER_SESSION_COOKIE, USER_SESSION_MAX_AGE } from "@/lib/user-auth";

export type FormState = { error: string | null };

export async function userLoginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const user = await getUserByEmail(email).catch(() => null);
  if (!user || !(await verifyPassword(user, password))) {
    await new Promise((r) => setTimeout(r, 700));
    return { error: "Email yoki parol noto'g'ri." };
  }

  const token = await createUserSessionToken(user.id);
  if (!token) return { error: "Serverda AUTH_SECRET sozlanmagan." };

  (await cookies()).set(USER_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: USER_SESSION_MAX_AGE,
  });
  redirect("/profil");
}
