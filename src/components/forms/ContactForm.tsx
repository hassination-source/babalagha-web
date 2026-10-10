"use client";

import { useActionState } from "react";
import { submitContact, type FormState } from "@/lib/public-actions";
import { Consent, Field, FormAlert, Hidden, Submit, Success, type FormDict } from "./FormKit";

export function ContactForm({
  dict,
  kinds,
  token,
  locale,
  successMessage,
  defaultKind,
  defaultSubject,
}: {
  dict: FormDict;
  kinds: Record<string, string>;
  token: string;
  locale: string;
  successMessage: string;
  defaultKind?: string;
  defaultSubject?: string;
}) {
  const [state, action] = useActionState<FormState, FormData>(submitContact, { status: "idle" });
  if (state.status === "success") return <Success message={successMessage} />;
  return (
    <form action={action} noValidate className="relative space-y-5">
      <Hidden token={token} locale={locale} />
      <FormAlert state={state} dict={dict} />
      <Field name="kind" label={dict.kind} as="select" required state={state} dict={dict} defaultValue={defaultKind ?? "GENERAL"}>
        {Object.entries(kinds).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="name" label={dict.name} required autoComplete="name" state={state} dict={dict} />
        <Field name="phone" label={dict.phone} type="tel" required autoComplete="tel" dir="ltr" inputMode="tel" hint={dict.phoneHint} state={state} dict={dict} />
      </div>
      <Field name="email" label={dict.email} type="email" autoComplete="email" dir="ltr" state={state} dict={dict} />
      <Field name="subject" label={dict.subject} state={state} dict={dict} defaultValue={defaultSubject} />
      <Field name="message" label={dict.message} as="textarea" required state={state} dict={dict} />
      <Consent state={state} dict={dict} privacyHref={`/${locale}/privacy`} />
      <Submit dict={dict} />
    </form>
  );
}
