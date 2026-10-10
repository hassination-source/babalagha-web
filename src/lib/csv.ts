import Papa from "papaparse";
import { retailerAdminSchema, type RetailerAdminInput } from "./validation";
import { GOVERNORATES } from "./iraq";

/** Column order of the import/export template. */
export const RETAILER_CSV_COLUMNS = [
  "name_ar",
  "name_en",
  "type",
  "governorate",
  "city_ar",
  "city_en",
  "district_ar",
  "district_en",
  "address_ar",
  "address_en",
  "latitude",
  "longitude",
  "phone",
  "opening_hours",
  "notes_ar",
  "notes_en",
  "verified",
  "status",
] as const;

const TRUE = new Set(["true", "1", "yes", "y", "نعم"]);

/** Accept governorate slugs, English names or Arabic names (with or without "ال"). */
export function resolveGovernorate(value: string): string | undefined {
  const v = value.trim().toLowerCase();
  if (!v) return undefined;
  const strip = (s: string) => s.replace(/^ال/, "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي");
  return GOVERNORATES.find(
    (g) => g.slug === v || g.en.toLowerCase() === v || strip(g.ar) === strip(v),
  )?.slug;
}

export type CsvRowResult =
  | { row: number; ok: true; data: RetailerAdminInput }
  | { row: number; ok: false; errors: string[] };

export function parseRetailerCsv(text: string): { rows: CsvRowResult[]; missingColumns: string[] } {
  const clean = text.replace(/^﻿/, "");
  const parsed = Papa.parse<Record<string, string>>(clean, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.trim().toLowerCase(),
  });
  const headers = parsed.meta.fields ?? [];
  const required = ["name_ar", "governorate", "city_ar"];
  const missingColumns = required.filter((c) => !headers.includes(c));
  if (missingColumns.length) return { rows: [], missingColumns };

  const rows: CsvRowResult[] = parsed.data.map((r, i) => {
    const get = (k: string) => (r[k] ?? "").trim();
    const input = {
      nameAr: get("name_ar"),
      nameEn: get("name_en") || undefined,
      type: (get("type") || "SUPERMARKET").toUpperCase(),
      governorate: resolveGovernorate(get("governorate")) ?? get("governorate"),
      cityAr: get("city_ar"),
      cityEn: get("city_en") || undefined,
      districtAr: get("district_ar") || undefined,
      districtEn: get("district_en") || undefined,
      addressAr: get("address_ar") || undefined,
      addressEn: get("address_en") || undefined,
      latitude: get("latitude") || undefined,
      longitude: get("longitude") || undefined,
      phone: get("phone") || undefined,
      openingHours: get("opening_hours") || undefined,
      notesAr: get("notes_ar") || undefined,
      notesEn: get("notes_en") || undefined,
      verified: TRUE.has(get("verified").toLowerCase()),
      status: (get("status") || "PENDING").toUpperCase(),
    };
    const res = retailerAdminSchema.safeParse(input);
    // Row numbers are 1-based and account for the header row.
    if (res.success) return { row: i + 2, ok: true as const, data: res.data };
    return {
      row: i + 2,
      ok: false as const,
      errors: res.error.issues.map((iss) => `${String(iss.path[0])}: ${iss.message}`),
    };
  });
  return { rows, missingColumns: [] };
}

type ExportRow = {
  nameAr: string; nameEn: string | null; type: string; governorate: string; cityAr: string; cityEn: string | null;
  districtAr: string | null; districtEn: string | null; addressAr: string | null; addressEn: string | null;
  latitude: number | null; longitude: number | null; phone: string | null; openingHours: string | null;
  notesAr: string | null; notesEn: string | null; verified: boolean; status: string;
};

/** Neutralise spreadsheet formula injection (=, +, -, @ at the start of a cell). */
export function safeCell(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /^[=+\-@\t\r]/.test(s) && !/^[+-]?\d/.test(s) ? `'${s}` : s;
}

export function retailersToCsv(rows: ExportRow[]): string {
  const data = rows.map((r) => [
    r.nameAr, r.nameEn, r.type, r.governorate, r.cityAr, r.cityEn, r.districtAr, r.districtEn, r.addressAr,
    r.addressEn, r.latitude, r.longitude, r.phone, r.openingHours, r.notesAr, r.notesEn, r.verified, r.status,
  ].map(safeCell));
  // BOM so Excel opens Arabic text correctly.
  return "﻿" + Papa.unparse({ fields: [...RETAILER_CSV_COLUMNS], data });
}

export function toCsv(fields: string[], data: unknown[][]): string {
  return "﻿" + Papa.unparse({ fields, data: data.map((r) => r.map(safeCell)) });
}
