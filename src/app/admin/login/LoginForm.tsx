"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, { error: "" });
  return (
    <form action={action} className="space-y-4">
      {state.error && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p>}
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-semibold">البريد الإلكتروني</label>
        <input id="email" name="email" type="email" required autoComplete="username" dir="ltr" className="field" />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-semibold">كلمة المرور</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" dir="ltr" className="field" />
      </div>
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60">{pending ? "جارٍ الدخول…" : "دخول"}</button>
    </form>
  );
}
