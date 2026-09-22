"use client";

import { useActionState } from "react";
import { userLoginAction, type FormState } from "@/app/kirish/actions";

const initial: FormState = { error: null };

export default function UserLoginForm() {
  const [state, action, pending] = useActionState(userLoginAction, initial);

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <p role="alert" className="rounded border border-[#C93B3B] px-3 py-2 text-sm text-[#C93B3B]">
          {state.error}
        </p>
      )}
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
          Parol
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded border border-line bg-bg px-3 py-2"
          autoComplete="current-password"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-ink px-4 py-2.5 font-bold text-white disabled:opacity-60"
      >
        {pending ? "Kirilmoqda..." : "Kirish"}
      </button>
    </form>
  );
}
