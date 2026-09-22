"use client";

import { useActionState } from "react";
import { registerAction, type FormState } from "@/app/royxat/actions";

const initial: FormState = { error: null };

export default function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initial);

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <p role="alert" className="rounded border border-[#C93B3B] px-3 py-2 text-sm text-[#C93B3B]">
          {state.error}
        </p>
      )}
      <div>
        <label htmlFor="nickname" className="mb-1 block text-sm font-semibold">
          Ism / taxallus
        </label>
        <input
          id="nickname"
          name="nickname"
          required
          className="w-full rounded border border-line bg-bg px-3 py-2"
          autoComplete="nickname"
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-semibold">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded border border-line bg-bg px-3 py-2"
          autoComplete="email"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-semibold">
          Parol (kamida 6 belgi)
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="w-full rounded border border-line bg-bg px-3 py-2"
          autoComplete="new-password"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-ink px-4 py-2.5 font-bold text-white disabled:opacity-60"
      >
        {pending ? "Yaratilmoqda..." : "Ro'yxatdan o'tish"}
      </button>
    </form>
  );
}
