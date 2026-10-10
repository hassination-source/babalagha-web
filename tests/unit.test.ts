import { describe, it, expect, beforeAll } from "vitest";
import { normalizePhone, contactSchema, partnerSchema, retailerAdminSchema } from "@/lib/validation";
import { parseRetailerCsv, retailersToCsv, resolveGovernorate, safeCell } from "@/lib/csv";
import { normalizeSearch } from "@/lib/search-normalize";
import { parseCoords } from "@/components/admin/RetailerForm";
import { translatePackage } from "@/lib/packages";
import { officialProducts, officialCategories, officialTimeline } from "@/data/official-catalog";

beforeAll(() => {
  process.env.SESSION_SECRET = "test-secret-0123456789abcdef0123456789abcdef";
});

describe("phone normalisation", () => {
  it.each([
    ["0780 117 7770", "+9647801177770"],
    ["07801177770", "+9647801177770"],
    ["+964 780 117 7770", "+9647801177770"],
    ["009647801177770", "+9647801177770"],
    ["٠٧٨٠١١٧٧٧٧٠", "+9647801177770"],
  ])("%s → %s", (input, out) => expect(normalizePhone(input)).toBe(out));
});

describe("form schemas", () => {
  const ok = { kind: "GENERAL", name: "علي", phone: "07801234567", message: "رسالة اختبار طويلة بما يكفي", consent: "on" };
  it("accepts a valid contact message", () => expect(contactSchema.safeParse(ok).success).toBe(true));
  it("requires consent", () => expect(contactSchema.safeParse({ ...ok, consent: undefined }).success).toBe(false));
  it("rejects invalid phone and email", () => {
    expect(contactSchema.safeParse({ ...ok, phone: "123" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...ok, email: "not-an-email" }).success).toBe(false);
  });
  it("treats empty optional email as absent", () => {
    const r = contactSchema.safeParse({ ...ok, email: "" });
    expect(r.success && r.data.email).toBe(undefined);
  });
  it("partner form rejects unknown governorates", () => {
    const base = { businessName: "x", contactName: "y", phone: "07801234567", governorate: "baghdad", cityDistrict: "c", businessType: "grocery", location: "l", consent: "on" };
    expect(partnerSchema.safeParse(base).success).toBe(true);
    expect(partnerSchema.safeParse({ ...base, governorate: "atlantis" }).success).toBe(false);
  });
  it("retailer coordinates must be inside Iraq", () => {
    const base = { nameAr: "س", governorate: "basra", cityAr: "البصرة" };
    expect(retailerAdminSchema.safeParse({ ...base, latitude: "30.5", longitude: "47.8" }).success).toBe(true);
    expect(retailerAdminSchema.safeParse({ ...base, latitude: "51.5", longitude: "-0.12" }).success).toBe(false);
  });
});

describe("CSV import/export", () => {
  it("resolves governorates written in Arabic, English or as slugs", () => {
    expect(resolveGovernorate("البصرة")).toBe("basra");
    expect(resolveGovernorate("بصرة")).toBe("basra");
    expect(resolveGovernorate("Erbil")).toBe("erbil");
    expect(resolveGovernorate("dhiqar")).toBe("dhiqar");
    expect(resolveGovernorate("Atlantis")).toBeUndefined();
  });
  it("parses valid and invalid rows with correct row numbers", () => {
    const csv = "﻿name_ar,governorate,city_ar,latitude,longitude,verified,status\nمتجر,بغداد,بغداد,33.3,44.4,نعم,active\nسيء,مكان,مدينة,,,,\n";
    const { rows, missingColumns } = parseRetailerCsv(csv);
    expect(missingColumns).toEqual([]);
    expect(rows[0]).toMatchObject({ row: 2, ok: true, data: { governorate: "baghdad", verified: true, status: "ACTIVE", latitude: 33.3 } });
    expect(rows[1]).toMatchObject({ row: 3, ok: false });
  });
  it("reports missing required columns", () => {
    expect(parseRetailerCsv("name,city\na,b").missingColumns).toEqual(["name_ar", "governorate", "city_ar"]);
  });
  it("neutralises spreadsheet formula injection but keeps phone numbers", () => {
    expect(safeCell("=HYPERLINK(\"x\")")).toBe("'=HYPERLINK(\"x\")");
    expect(safeCell("@SUM(A1)")).toBe("'@SUM(A1)");
    expect(safeCell("+9647801177770")).toBe("+9647801177770");
    expect(safeCell("-33.2")).toBe("-33.2");
  });
  it("export round-trips through import", () => {
    const csv = retailersToCsv([
      { nameAr: "متجر، مع فاصلة", nameEn: null, type: "GROCERY", governorate: "najaf", cityAr: "النجف", cityEn: null, districtAr: null, districtEn: null, addressAr: 'عنوان "مقتبس"', addressEn: null, latitude: 32.02, longitude: 44.34, phone: "+9647701234567", openingHours: null, notesAr: null, notesEn: null, verified: true, status: "ACTIVE" },
    ]);
    const { rows } = parseRetailerCsv(csv);
    expect(rows[0]).toMatchObject({ ok: true, data: { nameAr: "متجر، مع فاصلة", addressAr: 'عنوان "مقتبس"', governorate: "najaf", type: "GROCERY", verified: true } });
  });
});

describe("spam protection", () => {
  it("accepts a valid token after the minimum delay and rejects forged/fast/honeypot", async () => {
    const { formToken, checkSpam } = await import("@/lib/spam");
    const t0 = Date.now() - 10_000;
    const fd = (t: string, extra: Record<string, string> = {}) => {
      const f = new FormData();
      f.set("_t", t);
      for (const [k, v] of Object.entries(extra)) f.set(k, v);
      return f;
    };
    expect(checkSpam(fd(formToken(t0)))).toBe("ok");
    expect(checkSpam(fd(formToken(Date.now())))).toBe("too-fast");
    expect(checkSpam(fd(`${t0}.forged`))).toBe("bad-token");
    expect(checkSpam(fd(formToken(t0 - 13 * 3600_000)))).toBe("expired");
    expect(checkSpam(fd(formToken(t0), { website: "http://spam" }))).toBe("honeypot");
  });
});

describe("search normalisation", () => {
  it("matches Arabic spelling variants", () => {
    expect(normalizeSearch("الكرادة")).toBe(normalizeSearch("كراده"));
    expect(normalizeSearch("أربيل")).toBe(normalizeSearch("اربيل"));
    expect(normalizeSearch("مُعَجَّنات")).toBe(normalizeSearch("معجنات"));
  });
});

describe("coordinate parsing for the admin map picker", () => {
  it.each([
    ["https://www.google.com/maps/@33.3128,44.3615,15z", 33.3128, 44.3615],
    ["https://maps.google.com/?q=30.5085,47.7804", 30.5085, 47.7804],
    ["https://www.google.com/maps/place/x/data=!3m1!4b1!4m6!3m5!1s0!8m2!3d36.191!4d44.009", 36.191, 44.009],
    ["33.3128, 44.3615", 33.3128, 44.3615],
  ])("%s", (input, lat, lng) => expect(parseCoords(input)).toEqual({ lat, lng }));
  it("rejects points outside Iraq", () => expect(parseCoords("51.5072, -0.1276")).toBeNull());
});

describe("official catalogue data integrity", () => {
  it("every product belongs to a known category and has a unique slug", () => {
    const cats = new Set(officialCategories.map((c) => c.slug));
    expect(officialProducts.every((p) => cats.has(p.category))).toBe(true);
    expect(new Set(officialProducts.map((p) => p.slug)).size).toBe(officialProducts.length);
  });
  it("timeline starts in 1948 and is chronological", () => {
    expect(officialTimeline[0]!.year).toBe(1948);
    const years = officialTimeline.map((e) => e.year);
    expect([...years].sort((a, b) => a - b)).toEqual(years);
  });
  it("package labels translate", () => {
    expect(translatePackage("كيس 8 قطع")).toBe("Bag of 8");
    expect(translatePackage("كيس خبز اسمر 7 قطع")).toBe("Bag of 7");
    expect(translatePackage("كيلو زلابية")).toBe("Per kilo");
    expect(translatePackage("حجم متوسط")).toBe("Medium");
  });
});
