"use server";

import { db } from "./db";
import { checkSpam } from "./spam";
import { rateLimit } from "./rate-limit";
import { contactSchema, partnerSchema, retailerSubmissionSchema, fieldErrors } from "./validation";

/**
 * Public form handlers. Each one:
 *  1. rejects bots (honeypot + signed timing token),
 *  2. rate-limits per IP,
 *  3. validates on the server with zod,
 *  4. reports success ONLY after the record is committed to the database.
 */

export type FormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; error: "fix" | "rateLimited" | "spam" | "server"; fields?: Record<string, string>; values?: Record<string, string> };

function values(form: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of form.entries()) {
    if (typeof v === "string" && !k.startsWith("_") && k !== "website" && !k.startsWith("$")) out[k] = v;
  }
  return out;
}

async function guard(form: FormData, bucket: string): Promise<FormState | null> {
  const verdict = checkSpam(form);
  if (verdict === "honeypot") return { status: "success" }; // silently drop bots
  if (verdict !== "ok") return { status: "error", error: "spam", values: values(form) };
  if (!(await rateLimit(bucket, 5, 600))) return { status: "error", error: "rateLimited", values: values(form) };
  return null;
}

export async function submitContact(_prev: FormState, form: FormData): Promise<FormState> {
  try {
    const blocked = await guard(form, "contact");
    if (blocked) return blocked;
    const parsed = contactSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) return { status: "error", error: "fix", fields: fieldErrors(parsed.error), values: values(form) };
    const { consent: _c, ...data } = parsed.data;
    const locale = form.get("_locale") === "en" ? "en" : "ar";
    await db.inquiry.create({ data: { ...data, locale } });
    return { status: "success" };
  } catch (e) {
    console.error("[contact] submission failed:", (e as Error).message);
    return { status: "error", error: "server", values: values(form) };
  }
}

export async function submitPartner(_prev: FormState, form: FormData): Promise<FormState> {
  try {
    const blocked = await guard(form, "partner");
    if (blocked) return blocked;
    const raw = { ...Object.fromEntries(form), interests: form.getAll("interests").filter((v): v is string => typeof v === "string") };
    const parsed = partnerSchema.safeParse(raw);
    if (!parsed.success) return { status: "error", error: "fix", fields: fieldErrors(parsed.error), values: values(form) };
    const { consent: _c, ...data } = parsed.data;
    const locale = form.get("_locale") === "en" ? "en" : "ar";
    await db.partnerApplication.create({ data: { ...data, locale } });
    return { status: "success" };
  } catch (e) {
    console.error("[partner] submission failed:", (e as Error).message);
    return { status: "error", error: "server", values: values(form) };
  }
}

export async function submitRetailer(_prev: FormState, form: FormData): Promise<FormState> {
  try {
    const blocked = await guard(form, "retailer");
    if (blocked) return blocked;
    const parsed = retailerSubmissionSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) return { status: "error", error: "fix", fields: fieldErrors(parsed.error), values: values(form) };
    const { consent: _c, ...data } = parsed.data;
    await db.retailer.create({ data: { ...data, status: "PENDING", verified: false, type: "OTHER" } });
    return { status: "success" };
  } catch (e) {
    console.error("[retailer] submission failed:", (e as Error).message);
    return { status: "error", error: "server", values: values(form) };
  }
}
