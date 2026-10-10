"use server";

import type { RetailerStatus } from "@prisma/client";
import { db } from "../db";
import { requireUser } from "../auth";
import { audit, diff } from "../audit";
import { retailerAdminSchema, RETAILER_STATUSES, type RetailerAdminInput } from "../validation";
import { parseRetailerCsv } from "../csv";
import { fail, str, bool, zodFields, type ActionResult } from "../admin";

function formToInput(form: FormData) {
  const get = (k: string) => str(form, k) || undefined;
  return {
    nameAr: str(form, "nameAr"),
    nameEn: get("nameEn"),
    type: str(form, "type") || "SUPERMARKET",
    governorate: str(form, "governorate"),
    cityAr: str(form, "cityAr"),
    cityEn: get("cityEn"),
    districtAr: get("districtAr"),
    districtEn: get("districtEn"),
    addressAr: get("addressAr"),
    addressEn: get("addressEn"),
    latitude: get("latitude"),
    longitude: get("longitude"),
    phone: get("phone"),
    openingHours: get("openingHours"),
    notesAr: get("notesAr"),
    notesEn: get("notesEn"),
    verified: bool(form, "verified"),
    status: str(form, "status") || "PENDING",
  };
}

function toData(d: RetailerAdminInput) {
  return {
    ...d,
    nameEn: d.nameEn ?? null,
    cityEn: d.cityEn ?? null,
    districtAr: d.districtAr ?? null,
    districtEn: d.districtEn ?? null,
    addressAr: d.addressAr ?? null,
    addressEn: d.addressEn ?? null,
    latitude: d.latitude ?? null,
    longitude: d.longitude ?? null,
    phone: d.phone ?? null,
    openingHours: d.openingHours ?? null,
    notesAr: d.notesAr ?? null,
    notesEn: d.notesEn ?? null,
  };
}

export async function saveRetailer(id: string | null, form: FormData): Promise<ActionResult> {
  const user = await requireUser("retailers");
  const parsed = retailerAdminSchema.safeParse(formToInput(form));
  if (!parsed.success) return fail("يرجى تصحيح الحقول المشار إليها.", zodFields(parsed.error));
  const data = toData(parsed.data);
  if (data.status === "ACTIVE" && (data.latitude === null || data.longitude === null)) {
    return fail("لا يمكن نشر منفذ بدون إحداثيات. حدّد موقعه على الخريطة أولاً.", { latitude: "مطلوب للنشر" });
  }
  try {
    if (id) {
      const before = await db.retailer.findUnique({ where: { id } });
      if (!before) return fail("المنفذ غير موجود.");
      const after = await db.retailer.update({ where: { id }, data });
      const changes = diff(before as unknown as Record<string, unknown>, after as unknown as Record<string, unknown>);
      if (Object.keys(changes).length) await audit(user.id, "retailer.update", "Retailer", id, changes);
      return { ok: true, message: "تم حفظ المنفذ." };
    }
    const created = await db.retailer.create({ data });
    await audit(user.id, "retailer.create", "Retailer", created.id, { nameAr: created.nameAr, status: created.status });
    return { ok: true, redirect: `/admin/retailers/${created.id}?created=1` };
  } catch (e) {
    console.error("[retailer.save]", (e as Error).message);
    return fail("تعذّر حفظ المنفذ.");
  }
}

export async function setRetailerStatus(id: string, form: FormData): Promise<ActionResult> {
  const user = await requireUser("retailers");
  const status = str(form, "status") as RetailerStatus;
  if (!(RETAILER_STATUSES as readonly string[]).includes(status)) return fail("حالة غير صالحة.");
  const r = await db.retailer.findUnique({ where: { id } });
  if (!r) return fail("المنفذ غير موجود.");
  if (status === "ACTIVE" && (r.latitude === null || r.longitude === null)) {
    return fail("أضف إحداثيات المنفذ قبل نشره.", undefined);
  }
  await db.retailer.update({ where: { id }, data: { status, ...(status === "ACTIVE" && bool(form, "verify") ? { verified: true } : {}) } });
  await audit(user.id, `retailer.status.${status.toLowerCase()}`, "Retailer", id, { status: { from: r.status, to: status } });
  const msg: Record<RetailerStatus, string> = { ACTIVE: "تم نشر المنفذ.", INACTIVE: "تم تعطيل المنفذ.", REJECTED: "تم رفض الطلب.", PENDING: "أُعيد إلى قائمة المراجعة." };
  return { ok: true, message: msg[status] };
}

export async function deleteRetailer(id: string): Promise<ActionResult> {
  const user = await requireUser("retailers");
  const r = await db.retailer.delete({ where: { id } }).catch(() => null);
  if (!r) return fail("المنفذ غير موجود.");
  await audit(user.id, "retailer.delete", "Retailer", id, { nameAr: r.nameAr, governorate: r.governorate });
  return { ok: true, redirect: "/admin/retailers?deleted=1" };
}

// ---------- CSV import ----------

export type ImportAnalysis =
  | { ok: false; error: string }
  | {
      ok: true;
      total: number;
      valid: number;
      duplicates: number;
      invalid: { row: number; errors: string[] }[];
      sample: { row: number; nameAr: string; governorate: string; cityAr: string; hasCoords: boolean; status: string; duplicate: boolean }[];
    };

const MAX_CSV_BYTES = 2 * 1024 * 1024;
const dupKey = (r: { nameAr: string; governorate: string; cityAr: string }) =>
  `${r.nameAr.trim().toLowerCase()}|${r.governorate}|${r.cityAr.trim().toLowerCase()}`;

export async function analyzeRetailerCsv(text: string): Promise<ImportAnalysis> {
  await requireUser("retailers");
  if (!text.trim()) return { ok: false, error: "الملف فارغ." };
  if (text.length > MAX_CSV_BYTES) return { ok: false, error: "الملف أكبر من 2 ميغابايت. قسّمه إلى عدة ملفات." };
  const { rows, missingColumns } = parseRetailerCsv(text);
  if (missingColumns.length) return { ok: false, error: `أعمدة مطلوبة مفقودة: ${missingColumns.join("، ")}. استخدم القالب.` };
  const existing = new Set((await db.retailer.findMany({ select: { nameAr: true, governorate: true, cityAr: true } })).map(dupKey));
  const valid = rows.filter((r) => r.ok);
  return {
    ok: true,
    total: rows.length,
    valid: valid.length,
    duplicates: valid.filter((r) => r.ok && existing.has(dupKey(r.data))).length,
    invalid: rows.filter((r) => !r.ok).map((r) => ({ row: r.row, errors: r.ok ? [] : r.errors })),
    sample: valid.slice(0, 200).map((r) => {
      const d = (r as { data: RetailerAdminInput }).data;
      return { row: r.row, nameAr: d.nameAr, governorate: d.governorate, cityAr: d.cityAr, hasCoords: d.latitude !== undefined && d.longitude !== undefined, status: d.status, duplicate: existing.has(dupKey(d)) };
    }),
  };
}

export async function importRetailerCsv(text: string, mode: "skip" | "update"): Promise<{ ok: boolean; message: string }> {
  const user = await requireUser("retailers");
  if (text.length > MAX_CSV_BYTES) return { ok: false, message: "الملف كبير جداً." };
  const { rows, missingColumns } = parseRetailerCsv(text);
  if (missingColumns.length) return { ok: false, message: "أعمدة مطلوبة مفقودة." };
  const existing = await db.retailer.findMany({ select: { id: true, nameAr: true, governorate: true, cityAr: true } });
  const byKey = new Map(existing.map((e) => [dupKey(e), e.id]));
  let created = 0, updated = 0, skipped = 0, downgraded = 0;
  const invalid = rows.filter((r) => !r.ok).length;

  await db.$transaction(async (tx) => {
    for (const r of rows) {
      if (!r.ok) continue;
      const data = toData(r.data);
      // Rows without coordinates cannot be published on the map.
      if (data.status === "ACTIVE" && (data.latitude === null || data.longitude === null)) {
        data.status = "PENDING";
        downgraded++;
      }
      const id = byKey.get(dupKey(r.data));
      if (id) {
        if (mode === "update") {
          await tx.retailer.update({ where: { id }, data });
          updated++;
        } else skipped++;
      } else {
        const c = await tx.retailer.create({ data });
        byKey.set(dupKey(r.data), c.id);
        created++;
      }
    }
  }, { timeout: 60_000 });

  await audit(user.id, "retailer.import", "Retailer", null, { created, updated, skipped, invalid, downgraded });
  const parts = [`أُضيف ${created}`, `حُدّث ${updated}`, `تُجوهل ${skipped} مكرر`, `${invalid} صف غير صالح لم يُستورد`];
  if (downgraded) parts.push(`${downgraded} منفذ بلا إحداثيات حُوّل إلى «بانتظار المراجعة»`);
  return { ok: true, message: parts.join(" · ") };
}
