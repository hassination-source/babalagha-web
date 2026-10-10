export const LOCALES = ["ar", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ar";

export function isLocale(v: string | undefined | null): v is Locale {
  return v === "ar" || v === "en";
}

export function dir(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** Pick the localized field: pick(product, "name", "en") -> product.nameEn (falls back to Arabic). */
export function pick<T extends Record<string, unknown>>(obj: T, base: string, locale: Locale): string {
  const suffix = locale === "ar" ? "Ar" : "En";
  const v = obj[`${base}${suffix}`];
  if (typeof v === "string" && v.trim()) return v;
  const fallback = obj[`${base}Ar`];
  return typeof fallback === "string" ? fallback : "";
}

export function pickOptional<T extends Record<string, unknown>>(obj: T, base: string, locale: Locale): string | null {
  const v = pick(obj, base, locale);
  return v ? v : null;
}

export function localePath(locale: Locale, path = ""): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${p === "/" ? "" : p}`;
}

export function siteUrl(): string {
  return (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/** Arabic-Indic digits are not forced; Iraqi web copy commonly uses Western digits. */
export function formatDate(d: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-IQ" : "en-GB", { dateStyle: "medium" }).format(d);
}
