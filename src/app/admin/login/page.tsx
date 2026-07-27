"use client";

import { useActionState } from "react";
import { fr } from "@/lib/i18n";
import { loginAction, type AdminLoginState } from "./actions";

const initialState: AdminLoginState = {};

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col justify-center px-4">
      <h1 className="mb-6 font-serif text-2xl text-navy-900">{fr.admin.loginTitle}</h1>
      <form action={formAction}>
        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-medium text-navy-800">{fr.admin.passwordLabel}</span>
          <input
            name="password"
            type="password"
            required
            autoFocus
            className="w-full rounded-md border border-warm-200 bg-white px-3 py-2"
          />
        </label>
        {state.error && <p className="mb-4 text-sm text-red-700">{state.error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-navy-900 px-4 py-2.5 text-sm font-semibold text-warm-50 hover:bg-navy-800 disabled:opacity-60"
        >
          {fr.admin.loginSubmit}
        </button>
      </form>
    </div>
  );
}
