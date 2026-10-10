"use client";

import { useActionState } from "react";
import { submitRetailer, type FormState } from "@/lib/public-actions";
import { Consent, Field, FormAlert, Hidden, Submit, Success, type FormDict } from "./FormKit";

export function RetailerSubmitForm({
  dict,
  token,
  locale,
  governorates,
}: {
  dict: FormDict;
  token: string;
  locale: string;
  governorates: { value: string; label: string }[];
}) {
  const [state, action] = useActionState<FormState, FormData>(submitRetailer, { status: "idle" });
  if (state.status === "success") return <Success message={dict.retailerSuccess} />;
  return (
    <form action={action} noValidate className="relative space-y-5">
      <Hidden token={token} locale={locale} />
      <FormAlert state={state} dict={dict} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="nameAr" label={dict.storeName} required state={state} dict={dict} />
        <Field name="governorate" label={dict.governorate} as="select" required state={state} dict={dict} defaultValue="">
          <option value="" disabled>{dict.choose}</option>
          {governorates.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
        </Field>
        <Field name="cityAr" label={dict.city} required state={state} dict={dict} />
        <Field name="districtAr" label={dict.district} state={state} dict={dict} />
      </div>
      <Field name="addressAr" label={dict.address} required hint={dict.locationHint} state={state} dict={dict} />
      <div className="grid gap-5 sm:grid-cols-3">
        <Field name="phone" label={dict.storePhone} type="tel" dir="ltr" inputMode="tel" state={state} dict={dict} />
        <Field name="submittedBy" label={dict.yourName} required autoComplete="name" state={state} dict={dict} />
        <Field name="submitterPhone" label={dict.yourPhone} type="tel" required dir="ltr" inputMode="tel" autoComplete="tel" state={state} dict={dict} />
      </div>
      <Consent state={state} dict={dict} privacyHref={`/${locale}/privacy`} />
      <Submit dict={dict} />
    </form>
  );
}
