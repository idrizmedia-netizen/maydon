"use client";

import { useActionState, useState } from "react";
import AvatarUploader from "./AvatarUploader";
import { updateProfileAction, type FormState } from "@/app/profil/actions";

const initial: FormState = { error: null };

export default function ProfileForm({ nickname, avatar }: { nickname: string; avatar: string }) {
  const [state, action, pending] = useActionState(updateProfileAction, initial);
  const [avatarUrl, setAvatarUrl] = useState(avatar);

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <p role="alert" className="rounded border border-[#C93B3B] px-3 py-2 text-sm text-[#C93B3B]">
          {state.error}
        </p>
      )}
      {state.ok && <p className="rounded border border-hl px-3 py-2 text-sm">Saqlandi.</p>}

      <AvatarUploader current={avatarUrl} onUploaded={setAvatarUrl} />
      <input type="hidden" name="avatar" value={avatarUrl} />

      <div>
        <label htmlFor="nickname" className="mb-1 block text-sm font-semibold">
          Ism / taxallus
        </label>
        <input
          id="nickname"
          name="nickname"
          defaultValue={nickname}
          required
          className="w-full rounded border border-line bg-bg px-3 py-2"
        />
      </div>

      <button type="submit" disabled={pending} className="rounded bg-ink px-4 py-2 font-bold text-white disabled:opacity-60">
        {pending ? "Saqlanmoqda..." : "Saqlash"}
      </button>
    </form>
  );
}
