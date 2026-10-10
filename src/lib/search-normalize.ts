/** Client-safe Arabic/English search normalisation (mirrors normalizeArabic in catalog.ts). */
export function normalizeSearch(s: string): string {
  return s
    .replace(/[ً-ْـ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/^ال|\sال/g, (m) => m.replace("ال", ""))
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
