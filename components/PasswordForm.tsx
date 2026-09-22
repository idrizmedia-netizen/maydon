"use client";

import { useActionState } from "react";
import { changePasswordAction, type FormState } from "@/app/profil/actions";

const initial: FormState = { error: null };

export default function PasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, initial);

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <p role="alert" className="rounded border border-[#C93B3B] px-3 py-2 text-sm text-[#C93B3B]">
          {state.error}
        </p>
      )}
      {state.ok && <p className="rounded border border-hl px-3 py-2 text-sm">Parol yangilandi.</p>}
      <div>
        <label htmlFor="current" className="mb-1 block text-sm font-semibold">
          Joriy parol
        </label>
        <input id="current" name="current" type="password" required className="w-full rounded border border-line bg-bg px-3 py-2" />
      </div>
      <div>
        <label htmlFor="next" className="mb-1 block text-sm font-semibold">
          Yangi parol
        </label>
        <input id="next" name="next" type="password" required minLength={6} className="w-full rounded border border-line bg-bg px-3 py-2" />
      </div>
      <button type="submit" disabled={pending} className="rounded bg-ink px-4 py-2 font-bold text-white disabled:opacity-60">
        {pending ? "Yangilanmoqda..." : "Parolni almashtirish"}
      </button>
    </form>
  );
}
