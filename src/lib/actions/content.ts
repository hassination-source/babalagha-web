"use server";

import { z } from "zod";
import { db } from "../db";
import { requireUser, hashPassword } from "../auth";
import { audit } from "../audit";
import { storeImage, UploadError } from "../storage";
import { CONTENT_DEFAULTS, SETTING_DEFAULTS, type ContentKey, type SettingKey } from "../content";
import { normalizePhone } from "../validation";
import { fail, str, optStr, bool, int, type ActionResult } from "../admin";

export async function saveContentBlocks(form: FormData): Promise<ActionResult> {
  const user = await requireUser("content");
  const changed: string[] = [];
  for (const key of Object.keys(CONTENT_DEFAULTS) as ContentKey[]) {
    const ar = str(form, `${key}.ar`);
    const en = str(form, `${key}.en`);
    if (!form.has(`${key}.ar`)) continue;
    if (ar.length > 3000 || en.length > 3000) return fail(`النص طويل جداً في «${key}».`);
    const existing = await db.contentBlock.findUnique({ where: { key } });
    const def = CONTENT_DEFAULTS[key];
    // Store only overrides; empty or default text falls back to the built-in copy.
    const valueAr = ar === def.ar ? "" : ar;
    const valueEn = en === def.en ? "" : en;
    if (!valueAr && !valueEn) {
      if (existing) {
        await db.contentBlock.delete({ where: { key } });
        changed.push(key);
      }
      continue;
    }
    if (existing?.valueAr === valueAr && existing?.valueEn === valueEn) continue;
    await db.contentBlock.upsert({ where: { key }, update: { valueAr, valueEn }, create: { key, valueAr, valueEn } });
    changed.push(key);
  }
  if (changed.length) await audit(user.id, "content.update", "ContentBlock", null, { keys: changed });
  return { ok: true, message: changed.length ? `تم حفظ ${changed.length} نص.` : "لا توجد تغييرات." };
}

const settingRules: Partial<Record<SettingKey, (v: string) => string | null>> = {
  "contact.phone.management": (v) => (v ? normalizePhone(v) : ""),
  "contact.phone.sales": (v) => (v ? normalizePhone(v) : ""),
  "contact.phone.customer": (v) => (v ? normalizePhone(v) : ""),
  "contact.whatsapp": (v) => (v ? normalizePhone(v) : ""),
  "contact.email": (v) => (!v || z.email().safeParse(v).success ? v : null),
  "social.facebook": (v) => (!v || /^https:\/\/(www\.)?facebook\.com\//.test(v) ? v : null),
  "social.instagram": (v) => (!v || /^https:\/\/(www\.)?instagram\.com\//.test(v) ? v : null),
};

export async function saveSettings(form: FormData): Promise<ActionResult> {
  const user = await requireUser("content");
  const errors: Record<string, string> = {};
  const updates: [SettingKey, string][] = [];
  for (const key of Object.keys(SETTING_DEFAULTS) as SettingKey[]) {
    if (key === "home.hero.image") continue;
    if (key === "locator.showDemo") {
      updates.push([key, bool(form, key) ? "true" : "false"]);
      continue;
    }
    if (!form.has(key)) continue;
    const raw = str(form, key).slice(0, 500);
    const rule = settingRules[key];
    const v = rule ? rule(raw) : raw;
    if (v === null) {
      errors[key] = "قيمة غير صالحة";
      continue;
    }
    if (v && /phone|whatsapp/.test(key) && !/^\+?\d{8,15}$/.test(v)) {
      errors[key] = "رقم هاتف غير صالح";
      continue;
    }
    updates.push([key, v]);
  }
  if (Object.keys(errors).length) return fail("يرجى تصحيح الحقول المشار إليها.", errors);
  const before = new Map((await db.setting.findMany()).map((s) => [s.key, s.value]));
  const changes: Record<string, { from: string; to: string }> = {};
  for (const [key, value] of updates) {
    const prev = before.get(key) ?? SETTING_DEFAULTS[key];
    if (prev === value) continue;
    await db.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
    changes[key] = { from: prev, to: value };
  }
  if (Object.keys(changes).length) await audit(user.id, "settings.update", "Setting", null, changes);
  return { ok: true, message: "تم حفظ الإعدادات." };
}

export async function uploadHeroImage(form: FormData): Promise<ActionResult> {
  const user = await requireUser("content");
  if (str(form, "intent") === "reset") {
    await db.setting.deleteMany({ where: { key: "home.hero.image" } });
    await audit(user.id, "settings.hero.reset", "Setting", "home.hero.image");
    return { ok: true, message: "أُعيدت الصورة الافتراضية." };
  }
  const file = form.get("image");
  if (!(file instanceof File) || file.size === 0) return fail("اختر صورة.");
  try {
    const stored = await storeImage(file, "banners");
    await db.media.create({ data: { url: stored.url, key: stored.key, mime: stored.mime, width: stored.width, height: stored.height, size: stored.size } });
    await db.setting.upsert({ where: { key: "home.hero.image" }, update: { value: stored.url }, create: { key: "home.hero.image", value: stored.url } });
    await audit(user.id, "settings.hero.upload", "Setting", "home.hero.image", { url: stored.url });
  } catch (e) {
    return fail(e instanceof UploadError ? `تعذّر رفع الصورة (${e.message}).` : "تعذّر رفع الصورة.");
  }
  return { ok: true, message: "تم تحديث صورة الواجهة." };
}

// ---------- Timeline ----------

export async function saveTimelineEntry(id: string | null, form: FormData): Promise<ActionResult> {
  const user = await requireUser("content");
  if (str(form, "intent") === "delete" && id) {
    await db.timelineEntry.delete({ where: { id } });
    await audit(user.id, "timeline.delete", "TimelineEntry", id);
    return { ok: true, message: "تم الحذف." };
  }
  const year = int(form, "year");
  if (year < 1900 || year > 2100) return fail("السنة غير صالحة.", { year: "سنة غير صالحة" });
  const titleAr = str(form, "titleAr");
  const titleEn = str(form, "titleEn");
  if (!titleAr || !titleEn) return fail("العنوان بالعربية والإنجليزية مطلوب.");
  const data = { year, titleAr, titleEn, placeAr: optStr(form, "placeAr"), placeEn: optStr(form, "placeEn"), sortOrder: int(form, "sortOrder"), published: bool(form, "published") };
  if (id) {
    await db.timelineEntry.update({ where: { id }, data });
    await audit(user.id, "timeline.update", "TimelineEntry", id, data);
  } else {
    const c = await db.timelineEntry.create({ data });
    await audit(user.id, "timeline.create", "TimelineEntry", c.id, data);
  }
  return { ok: true, message: "تم الحفظ." };
}

// ---------- Gallery ----------

export async function addGalleryImage(form: FormData): Promise<ActionResult> {
  const user = await requireUser("content");
  const file = form.get("image");
  if (!(file instanceof File) || file.size === 0) return fail("اختر صورة.");
  const link = str(form, "link");
  if (link && !/^https:\/\//.test(link)) return fail("الرابط يجب أن يبدأ بـ https://");
  try {
    const stored = await storeImage(file, "gallery");
    await db.media.create({ data: { url: stored.url, key: stored.key, mime: stored.mime, width: stored.width, height: stored.height, size: stored.size } });
    const max = await db.galleryImage.aggregate({ _max: { sortOrder: true } });
    const g = await db.galleryImage.create({
      data: { url: stored.url, altAr: optStr(form, "altAr"), altEn: optStr(form, "altEn"), link: link || null, sortOrder: (max._max.sortOrder ?? 0) + 1 },
    });
    await audit(user.id, "gallery.create", "GalleryImage", g.id);
  } catch (e) {
    return fail(e instanceof UploadError ? `تعذّر رفع الصورة (${e.message}).` : "تعذّر رفع الصورة.");
  }
  return { ok: true, message: "تمت إضافة الصورة." };
}

export async function updateGalleryImage(id: string, form: FormData): Promise<ActionResult> {
  const user = await requireUser("content");
  if (str(form, "intent") === "delete") {
    await db.galleryImage.delete({ where: { id } });
    await audit(user.id, "gallery.delete", "GalleryImage", id);
    return { ok: true, message: "تم الحذف." };
  }
  const link = str(form, "link");
  if (link && !/^https:\/\//.test(link)) return fail("الرابط يجب أن يبدأ بـ https://");
  await db.galleryImage.update({
    where: { id },
    data: { altAr: optStr(form, "altAr"), altEn: optStr(form, "altEn"), link: link || null, sortOrder: int(form, "sortOrder"), published: bool(form, "published") },
  });
  await audit(user.id, "gallery.update", "GalleryImage", id);
  return { ok: true, message: "تم الحفظ." };
}

// ---------- Users ----------

const ROLES = ["ADMIN", "EDITOR", "SALES"] as const;

export async function saveUser(id: string | null, form: FormData): Promise<ActionResult> {
  const me = await requireUser("users");
  const name = str(form, "name");
  const email = str(form, "email").toLowerCase();
  const role = str(form, "role") as (typeof ROLES)[number];
  const password = String(form.get("password") ?? "");
  const active = id ? bool(form, "active") : true;
  if (!name) return fail("الاسم مطلوب.", { name: "مطلوب" });
  if (!z.email().safeParse(email).success) return fail("بريد غير صالح.", { email: "بريد غير صالح" });
  if (!ROLES.includes(role)) return fail("دور غير صالح.");
  if ((!id || password) && password.length < 12) return fail("كلمة المرور يجب ألا تقل عن 12 حرفاً.", { password: "12 حرفاً على الأقل" });

  if (id) {
    const target = await db.user.findUnique({ where: { id } });
    if (!target) return fail("المستخدم غير موجود.");
    if (id === me.id && (role !== "ADMIN" || !active)) return fail("لا يمكنك إزالة صلاحية المدير أو تعطيل حسابك بنفسك.");
    if (target.role === "ADMIN" && (role !== "ADMIN" || !active)) {
      const admins = await db.user.count({ where: { role: "ADMIN", active: true } });
      if (admins <= 1) return fail("يجب أن يبقى مدير نظام فعّال واحد على الأقل.");
    }
    try {
      await db.user.update({
        where: { id },
        data: { name, email, role, active, ...(password ? { passwordHash: await hashPassword(password) } : {}) },
      });
    } catch {
      return fail("البريد مستخدم لحساب آخر.", { email: "مستخدم مسبقاً" });
    }
    if (password || !active) await db.session.deleteMany({ where: { userId: id } });
    await audit(me.id, "user.update", "User", id, { role, active, passwordChanged: Boolean(password) });
    return { ok: true, message: "تم حفظ المستخدم." };
  }
  try {
    const u = await db.user.create({ data: { name, email, role, passwordHash: await hashPassword(password) } });
    await audit(me.id, "user.create", "User", u.id, { email, role });
  } catch {
    return fail("البريد مستخدم لحساب آخر.", { email: "مستخدم مسبقاً" });
  }
  return { ok: true, message: "تم إنشاء المستخدم.", redirect: "/admin/users" };
}
