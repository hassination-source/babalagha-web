"use client";

import { useFormStatus } from "react-dom";
import type { Dictionary } from "@/lib/dictionary";
import type { FormState } from "@/lib/public-actions";

export type FormDict = Dictionary["form"];

export function errorText(dict: FormDict, code?: string) {
  if (!code) return undefined;
  return (dict.errors as Record<string, string>)[code] ?? dict.errors.invalid;
}

export function Hidden({ token, locale }: { token: string; locale: string }) {
  return (
    <>
      <input type="hidden" name="_t" value={token} />
      <input type="hidden" name="_locale" value={locale} />
      {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
      <div aria-hidden="true" className="absolute -start-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
    </>
  );
}

export function Field({
  name,
  label,
  state,
  dict,
  required,
  hint,
  type = "text",
  as,
  children,
  rows,
  autoComplete,
  dir,
  defaultValue,
  inputMode,
}: {
  name: string;
  label: string;
  state: FormState;
  dict: FormDict;
  required?: boolean;
  hint?: string;
  type?: string;
  as?: "textarea" | "select";
  children?: React.ReactNode;
  rows?: number;
  autoComplete?: string;
  dir?: "ltr" | "rtl";
  defaultValue?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  const err = state.status === "error" ? errorText(dict, state.fields?.[name]) : undefined;
  const value = state.status === "error" ? state.values?.[name] ?? defaultValue : defaultValue;
  const id = `f-${name}`;
  const describedBy = [hint ? `${id}-hint` : null, err ? `${id}-err` : null].filter(Boolean).join(" ") || undefined;
  const common = {
    id,
    name,
    required,
    "aria-invalid": err ? (true as const) : undefined,
    "aria-describedby": describedBy,
    className: "field",
    defaultValue: value,
  };
  const k = `${name}-${state.status}-${value ?? ""}`;
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label} {required ? <span className="text-crust" aria-hidden>*</span> : <span className="text-sm font-normal text-muted">({dict.optional})</span>}
      </label>
      {as === "textarea" ? (
        <textarea key={k} {...common} rows={rows ?? 5} />
      ) : as === "select" ? (
        <select key={k} {...common}>{children}</select>
      ) : (
        <input key={k} {...common} type={type} autoComplete={autoComplete} dir={dir} inputMode={inputMode} />
      )}
      {hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
      {err && <p id={`${id}-err`} className="field-error">{err}</p>}
    </div>
  );
}

export function Consent({ state, dict, privacyHref }: { state: FormState; dict: FormDict; privacyHref: string }) {
  const err = state.status === "error" ? errorText(dict, state.fields?.consent) : undefined;
  return (
    <div>
      <label className="flex items-start gap-3">
        <input type="checkbox" name="consent" required className="mt-1.5 size-5 shrink-0 accent-seal" aria-invalid={err ? true : undefined} aria-describedby={err ? "f-consent-err" : undefined} />
        <span>
          {dict.consent}{" "}
          <a href={privacyHref} target="_blank" className="link-underline">{dict.privacy}</a>
        </span>
      </label>
      {err && <p id="f-consent-err" className="field-error">{err}</p>}
    </div>
  );
}

export function Submit({ dict }: { dict: FormDict }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60 sm:w-auto">
      {pending ? dict.sending : dict.submit}
    </button>
  );
}

export function FormAlert({ state, dict }: { state: FormState; dict: FormDict }) {
  if (state.status !== "error") return null;
  return (
    <div role="alert" className="rounded-[var(--radius-soft)] border border-[#b3261e]/40 bg-[#b3261e]/[0.06] px-4 py-3 text-[#8c1d17]">
      {errorText(dict, state.error)}
    </div>
  );
}

export function Success({ message }: { message: string }) {
  return (
    <div role="status" className="rounded-[var(--radius-soft)] border border-kashi/40 bg-kashi/[0.08] px-5 py-6">
      <p className="flex items-start gap-3 text-lg text-kashi-deep">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden className="mt-0.5 shrink-0">
          <circle cx="12" cy="12" r="9.5" />
          <path d="M7.5 12.5l3 3 6-6.5" />
        </svg>
        {message}
      </p>
    </div>
  );
}
