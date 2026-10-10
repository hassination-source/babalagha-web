"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useRef, useState, useTransition } from "react";
import type { ActionResult } from "@/lib/admin";

const FieldErrors = createContext<Record<string, string>>({});
export const useFieldError = (name: string) => useContext(FieldErrors)[name];

/**
 * Submits via a server action without React's automatic form reset, so values survive validation
 * errors. Shows the server's message and field errors; follows `redirect` on success.
 */
export function ActionForm({
  action,
  children,
  className = "space-y-5",
  confirm,
  resetOnSuccess,
  encType,
}: {
  action: (fd: FormData) => Promise<ActionResult>;
  children: React.ReactNode;
  className?: string;
  confirm?: string;
  resetOnSuccess?: boolean;
  encType?: string;
}) {
  const router = useRouter();
  const ref = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  return (
    <form
      ref={ref}
      encType={encType}
      className={className}
      aria-busy={pending}
      onSubmit={(e) => {
        e.preventDefault();
        if (confirm && !window.confirm(confirm)) return;
        const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        const fd = new FormData(e.currentTarget, submitter ?? undefined);
        start(async () => {
          try {
            const r = await action(fd);
            setResult(r);
            if (r.ok) {
              if (resetOnSuccess) ref.current?.reset();
              if (r.redirect) router.push(r.redirect);
              router.refresh();
            }
          } catch (err) {
            // Redirects thrown by requireUser surface here as NEXT_REDIRECT; let Next handle them.
            if (err && typeof err === "object" && "digest" in err && String((err as { digest: string }).digest).startsWith("NEXT_REDIRECT")) throw err;
            setResult({ ok: false, error: "تعذّر تنفيذ العملية. تحقق من الاتصال وحاول مجدداً." });
          }
        });
      }}
    >
      <FieldErrors.Provider value={result && !result.ok ? result.fields ?? {} : {}}>
        {result && (
          <div
            role={result.ok ? "status" : "alert"}
            className={`rounded-md border px-4 py-3 text-[0.95rem] ${result.ok ? "border-kashi/40 bg-kashi/10 text-kashi-deep" : "border-red-700/30 bg-red-50 text-red-800"}`}
          >
            {result.ok ? result.message ?? "تم الحفظ." : result.error}
          </div>
        )}
        <fieldset disabled={pending} className="contents">
          {children}
        </fieldset>
      </FieldErrors.Provider>
    </form>
  );
}

export function SubmitButton({ children, variant = "primary", name, value }: { children: React.ReactNode; variant?: "primary" | "danger" | "ghost"; name?: string; value?: string }) {
  const cls =
    variant === "danger"
      ? "bg-red-700 text-white hover:bg-red-800"
      : variant === "ghost"
        ? "border border-line bg-white text-ink hover:border-seal"
        : "bg-seal text-flour hover:bg-seal-deep";
  return (
    <button type="submit" name={name} value={value} className={`inline-flex min-h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-50 ${cls}`}>
      {children}
    </button>
  );
}

export function AdminField({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  hint,
  as,
  rows,
  children,
  dir,
  step,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  hint?: string;
  as?: "textarea" | "select";
  rows?: number;
  children?: React.ReactNode;
  dir?: "ltr" | "rtl" | "auto";
  step?: string;
  placeholder?: string;
}) {
  const err = useFieldError(name);
  const id = `a-${name}`;
  const props = {
    id,
    name,
    required,
    defaultValue: defaultValue ?? undefined,
    dir,
    placeholder,
    "aria-invalid": err ? (true as const) : undefined,
    className: "field !min-h-10 !py-2 text-[0.95rem]",
  };
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">
        {label} {required && <span className="text-crust">*</span>}
      </label>
      {as === "textarea" ? <textarea {...props} rows={rows ?? 3} /> : as === "select" ? <select {...props}>{children}</select> : <input {...props} type={type} step={step} />}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {err && <p className="mt-1 text-sm text-red-700">{err}</p>}
    </div>
  );
}

export function Check({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="inline-flex min-h-10 items-center gap-2 text-sm font-medium">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4 accent-seal" />
      {label}
    </label>
  );
}
