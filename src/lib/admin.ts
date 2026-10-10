import "server-only";
import { z } from "zod";

/** Result returned by every admin server action (rendered by <ActionForm>). */
export type ActionResult =
  | { ok: true; message?: string; redirect?: string }
  | { ok: false; error: string; fields?: Record<string, string> };

export const fail = (error: string, fields?: Record<string, string>): ActionResult => ({ ok: false, error, fields });

export function str(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}
export function optStr(form: FormData, key: string): string | null {
  const v = str(form, key);
  return v ? v : null;
}
export function bool(form: FormData, key: string): boolean {
  const v = form.get(key);
  return v === "on" || v === "true" || v === "1";
}
export function int(form: FormData, key: string, fallback = 0): number {
  const n = Number(str(form, key));
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

/** Arabic messages for zod issues in the admin. */
export function zodFields(error: z.ZodError): Record<string, string> {
  const map: Record<string, string> = {
    required: "حقل مطلوب",
    tooLong: "النص طويل جداً",
    slug: "استخدم أحرفاً إنجليزية صغيرة وأرقاماً وشرطات فقط",
    coordinate: "إحداثية خارج حدود العراق",
    governorate: "اختر محافظة",
    phone: "رقم هاتف غير صالح",
    email: "بريد إلكتروني غير صالح",
  };
  const out: Record<string, string> = {};
  for (const i of error.issues) {
    const k = String(i.path[0] ?? "_");
    if (!out[k]) out[k] = map[i.message] ?? "قيمة غير صالحة";
  }
  return out;
}

export function isUniqueViolation(e: unknown): boolean {
  return typeof e === "object" && e !== null && "code" in e && (e as { code: string }).code === "P2002";
}
