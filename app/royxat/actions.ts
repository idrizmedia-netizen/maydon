"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createUser, validEmail } from "@/lib/users";
import { createUserSessionToken, USER_SESSION_COOKIE, USER_SESSION_MAX_AGE } from "@/lib/user-auth";

export type FormState = { error: string | null };

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nickname = String(formData.get("nickname") ?? "").trim();

  if (!validEmail(email)) return { error: "Email noto'g'ri formatda." };
  if (password.length < 6) return { error: "Parol kamida 6 belgidan iborat bo'lishi kerak." };
  if (!nickname) return { error: "Ism yoki taxallus kiriting." };

  let user;
  try {
    user = await createUser(email, password, nickname);
  } catch (e) {
    if (e instanceof Error && e.message === "EMAIL_BAND") {
      return { error: "Bu email bilan hisob allaqachon mavjud." };
    }
    return { error: "Ma'lumotlar bazasi ulanmagan. Birozdan keyin qayta urinib ko'ring." };
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
