"use client";

import { useActionState } from "react";
import { submitPartner, type FormState } from "@/lib/public-actions";
import { Consent, Field, FormAlert, Hidden, Submit, Success, type FormDict } from "./FormKit";

export function PartnerForm({
  dict,
  token,
  locale,
  successMessage,
  governorates,
  categories,
}: {
  dict: FormDict;
  token: string;
  locale: string;
  successMessage: string;
  governorates: { value: string; label: string }[];
  categories: { value: string; label: string }[];
}) {
  const [state, action] = useActionState<FormState, FormData>(submitPartner, { status: "idle" });
  if (state.status === "success") return <Success message={successMessage} />;
  return (
    <form action={action} noValidate className="relative space-y-5">
      <Hidden token={token} locale={locale} />
      <FormAlert state={state} dict={dict} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="businessName" label={dict.businessName} required autoComplete="organization" state={state} dict={dict} />
        <Field name="contactName" label={dict.contactName} required autoComplete="name" state={state} dict={dict} />
        <Field name="phone" label={dict.phone} type="tel" required autoComplete="tel" dir="ltr" inputMode="tel" hint={dict.phoneHint} state={state} dict={dict} />
        <Field name="email" label={dict.email} type="email" autoComplete="email" dir="ltr" state={state} dict={dict} />
        <Field name="governorate" label={dict.governorate} as="select" required state={state} dict={dict} defaultValue="">
          <option value="" disabled>{dict.choose}</option>
          {governorates.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
        </Field>
        <Field name="cityDistrict" label={dict.cityDistrict} required state={state} dict={dict} />
        <Field name="businessType" label={dict.businessType} as="select" required state={state} dict={dict} defaultValue="">
          <option value="" disabled>{dict.choose}</option>
          {Object.entries(dict.businessTypes).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Field>
        <Field name="businessSize" label={dict.businessSize} as="select" state={state} dict={dict} defaultValue="">
          <option value="">{dict.choose}</option>
          {Object.entries(dict.businessSizes).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Field>
      </div>
      <Field name="location" label={dict.location} required hint={dict.locationHint} state={state} dict={dict} />
      <fieldset>
        <legend className="field-label">{dict.interests} <span className="text-sm font-normal text-muted">({dict.optional})</span></legend>
        <div className="mt-1 grid gap-2 sm:grid-cols-2">
          {categories.map((c) => (
            <label key={c.value} className="flex min-h-11 items-center gap-3 rounded-[var(--radius-soft)] border border-line bg-white px-3">
              <input type="checkbox" name="interests" value={c.value} className="size-5 accent-seal" />
              <span>{c.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <Field name="message" label={dict.extra} as="textarea" rows={4} state={state} dict={dict} />
      <Consent state={state} dict={dict} privacyHref={`/${locale}/privacy`} />
      <Submit dict={dict} />
    </form>
  );
}
