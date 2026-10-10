import { z } from "zod";
import { GOVERNORATE_SLUGS } from "./iraq";

/** Accepts Iraqi mobile numbers (07XX XXX XXXX, +9647XX…, 009647…) and general international numbers. */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/[\s\-().]/g, "").replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  if (/^07\d{9}$/.test(digits)) return `+964${digits.slice(1)}`;
  if (/^009647\d{9}$/.test(digits)) return `+${digits.slice(2)}`;
  if (/^9647\d{9}$/.test(digits)) return `+${digits}`;
  return digits;
}

export const phoneSchema = z
  .string()
  .trim()
  .min(1, "required")
  .transform(normalizePhone)
  .refine((v) => /^\+?\d{8,15}$/.test(v), "phone");

const optionalEmail = z
  .string()
  .trim()
  .max(160)
  .optional()
  .transform((v) => (v ? v : undefined))
  .refine((v) => v === undefined || z.email().safeParse(v).success, "email");

const text = (max: number) => z.string().trim().min(1, "required").max(max, "tooLong");
const optionalText = (max: number) =>
  z.string().trim().max(max, "tooLong").optional().transform((v) => (v ? v : undefined));

export const INQUIRY_KINDS = ["GENERAL", "PRODUCT", "RETAILER", "PARTNERSHIP", "OTHER"] as const;

export const contactSchema = z.object({
  kind: z.enum(INQUIRY_KINDS, "required"),
  name: text(120),
  phone: phoneSchema,
  email: optionalEmail,
  subject: optionalText(160),
  message: z.string().trim().min(10, "tooShort").max(4000, "tooLong"),
  consent: z.literal("on", "consent"),
});

export const BUSINESS_TYPES = ["supermarket", "grocery", "wholesaler", "distributor", "hypermarket", "other"] as const;
export const BUSINESS_SIZES = ["small", "medium", "large", "multi"] as const;

export const partnerSchema = z.object({
  businessName: text(160),
  contactName: text(120),
  phone: phoneSchema,
  email: optionalEmail,
  governorate: z.enum(GOVERNORATE_SLUGS, "required"),
  cityDistrict: text(160),
  businessType: z.enum(BUSINESS_TYPES, "required"),
  location: text(300),
  businessSize: z.enum(BUSINESS_SIZES).optional().or(z.literal("").transform(() => undefined)),
  interests: z.array(z.string().max(80)).max(20).default([]),
  message: optionalText(4000),
  consent: z.literal("on", "consent"),
});

export const retailerSubmissionSchema = z.object({
  nameAr: text(160),
  governorate: z.enum(GOVERNORATE_SLUGS, "required"),
  cityAr: text(120),
  districtAr: optionalText(120),
  addressAr: text(300),
  phone: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? normalizePhone(v) : undefined))
    .refine((v) => v === undefined || /^\+?\d{8,15}$/.test(v), "phone"),
  submittedBy: text(120),
  submitterPhone: phoneSchema,
  consent: z.literal("on", "consent"),
});

export const RETAILER_TYPES = ["SUPERMARKET", "GROCERY", "DISTRIBUTOR", "WHOLESALER", "BAKERY_OUTLET", "OTHER"] as const;
export const RETAILER_STATUSES = ["PENDING", "ACTIVE", "INACTIVE", "REJECTED"] as const;

const coord = (min: number, max: number) =>
  z
    .union([z.number(), z.string()])
    .optional()
    .transform((v) => (v === undefined || v === "" ? undefined : Number(v)))
    .refine((v) => v === undefined || (Number.isFinite(v) && v >= min && v <= max), "coordinate");

/** Used by the admin form and the CSV importer. */
export const retailerAdminSchema = z.object({
  nameAr: text(160),
  nameEn: optionalText(160),
  type: z.enum(RETAILER_TYPES).default("SUPERMARKET"),
  governorate: z.enum(GOVERNORATE_SLUGS, "governorate"),
  cityAr: text(120),
  cityEn: optionalText(120),
  districtAr: optionalText(120),
  districtEn: optionalText(120),
  addressAr: optionalText(300),
  addressEn: optionalText(300),
  latitude: coord(28.5, 37.6),
  longitude: coord(38.5, 49.0),
  phone: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? normalizePhone(v) : undefined)),
  openingHours: optionalText(200),
  notesAr: optionalText(500),
  notesEn: optionalText(500),
  verified: z.boolean().default(false),
  status: z.enum(RETAILER_STATUSES).default("PENDING"),
});
export type RetailerAdminInput = z.infer<typeof retailerAdminSchema>;

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug");

/** Flatten zod errors to { field: code } for the form UI. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_");
    if (out[key]) continue;
    const code = issue.message && /^[a-zA-Z]+$/.test(issue.message) ? issue.message : "invalid";
    out[key] = code;
  }
  return out;
}
