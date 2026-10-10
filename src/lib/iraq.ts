/** Iraq's 18 governorates (including the Kurdistan Region governorates). Centers are approximate
 * geographic reference points used only to frame the map — never as outlet locations. */
export type Governorate = { slug: string; ar: string; en: string; center: [number, number] };

export const GOVERNORATES: Governorate[] = [
  { slug: "baghdad", ar: "بغداد", en: "Baghdad", center: [33.315, 44.366] },
  { slug: "basra", ar: "البصرة", en: "Basra", center: [30.508, 47.783] },
  { slug: "nineveh", ar: "نينوى", en: "Nineveh", center: [36.34, 43.13] },
  { slug: "erbil", ar: "أربيل", en: "Erbil", center: [36.191, 44.009] },
  { slug: "sulaymaniyah", ar: "السليمانية", en: "Sulaymaniyah", center: [35.557, 45.435] },
  { slug: "duhok", ar: "دهوك", en: "Duhok", center: [36.867, 42.988] },
  { slug: "kirkuk", ar: "كركوك", en: "Kirkuk", center: [35.468, 44.392] },
  { slug: "diyala", ar: "ديالى", en: "Diyala", center: [33.75, 44.65] },
  { slug: "anbar", ar: "الأنبار", en: "Anbar", center: [33.42, 43.3] },
  { slug: "salahaddin", ar: "صلاح الدين", en: "Salah Al-Din", center: [34.6, 43.68] },
  { slug: "babil", ar: "بابل", en: "Babil", center: [32.48, 44.43] },
  { slug: "karbala", ar: "كربلاء", en: "Karbala", center: [32.616, 44.025] },
  { slug: "najaf", ar: "النجف", en: "Najaf", center: [32.0, 44.33] },
  { slug: "wasit", ar: "واسط", en: "Wasit", center: [32.5, 45.82] },
  { slug: "qadisiyah", ar: "القادسية", en: "Al-Qadisiyah", center: [31.99, 44.92] },
  { slug: "maysan", ar: "ميسان", en: "Maysan", center: [31.84, 47.14] },
  { slug: "dhiqar", ar: "ذي قار", en: "Dhi Qar", center: [31.05, 46.26] },
  { slug: "muthanna", ar: "المثنى", en: "Al-Muthanna", center: [31.31, 45.28] },
];

export const GOVERNORATE_SLUGS = GOVERNORATES.map((g) => g.slug) as [string, ...string[]];

export function governorate(slug: string | null | undefined): Governorate | undefined {
  return GOVERNORATES.find((g) => g.slug === slug);
}

export function governorateName(slug: string, locale: "ar" | "en"): string {
  const g = governorate(slug);
  return g ? g[locale] : slug;
}

/** Map bounds for Iraq: [[south, west], [north, east]] */
export const IRAQ_BOUNDS: [[number, number], [number, number]] = [
  [29.0, 38.7],
  [37.4, 48.8],
];
export const IRAQ_CENTER: [number, number] = [33.2, 43.7];

export function directionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
