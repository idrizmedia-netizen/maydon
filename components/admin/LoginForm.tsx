"use client";

import { useActionState } from "react";
import { loginAction, type FormState } from "@/app/admin/actions";

const initial: FormState = { error: null };

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="login" className="mb-1 block text-sm font-semibold">
          Login
        </label>
        <input
          id="login"
          name="login"
          type="text"
          autoComplete="username"
          required
          className="w-full rounded border border-line bg-bg px-3 py-2.5 text-base"
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
          autoComplete="current-password"
          required
          className="w-full rounded border border-line bg-bg px-3 py-2.5 text-base"
        />
      </div>

      {state.error && (
        <p role="alert" className="rounded border border-[#C93B3B] px-3 py-2 text-sm text-[#C93B3B]">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-ink px-4 py-3 font-bold text-bg disabled:opacity-60"
      >
        {pending ? "Tekshirilmoqda..." : "Kirish"}
      </button>
    </form>
  );
}
