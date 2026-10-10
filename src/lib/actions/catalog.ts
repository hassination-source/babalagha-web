"use server";

import { z } from "zod";
import { db } from "../db";
import { requireUser } from "../auth";
import { audit, diff } from "../audit";
import { storeImage, UploadError } from "../storage";
import { slugSchema } from "../validation";
import { fail, str, optStr, bool, int, zodFields, isUniqueViolation, type ActionResult } from "../admin";

const rowsSchema = <T extends z.ZodTypeAny>(item: T) =>
  z
    .string()
    .optional()
    .transform((v, ctx) => {
      if (!v) return [];
      try {
        return JSON.parse(v);
      } catch {
        ctx.addIssue({ code: "custom", message: "invalid" });
        return z.NEVER;
      }
    })
    .pipe(z.array(item).max(30));

const variantRow = z.object({ labelAr: z.string().trim().min(1).max(120), labelEn: z.string().trim().max(120).optional().default("") });
const nutritionRow = z.object({ labelAr: z.string().trim().min(1).max(80), labelEn: z.string().trim().max(80).optional().default(""), value: z.string().trim().min(1).max(40) });

const productSchema = z.object({
  slug: slugSchema,
  nameAr: z.string().trim().min(1, "required").max(160, "tooLong"),
  nameEn: z.string().trim().min(1, "required").max(160, "tooLong"),
  categoryId: z.string().min(1, "required"),
});

const UPLOAD_ERRORS: Record<string, string> = {
  "too-large": "حجم الصورة أكبر من 8 ميغابايت.",
  "not-an-image": "الملف ليس صورة صالحة.",
  "unsupported-format": "الصيغ المسموحة: JPG، PNG، WebP، AVIF، HEIC.",
  empty: "الملف فارغ.",
  "storage-failed": "تعذّر رفع الصورة إلى التخزين.",
};
function uploadMessage(e: unknown) {
  if (e instanceof UploadError) return UPLOAD_ERRORS[e.message] ?? `تعذّر رفع الصورة (${e.message}).`;
  console.error("[upload]", (e as Error).message);
  return "تعذّر رفع الصورة.";
}

export async function saveProduct(id: string | null, form: FormData): Promise<ActionResult> {
  const user = await requireUser("catalog");
  const base = productSchema.safeParse({ slug: str(form, "slug"), nameAr: str(form, "nameAr"), nameEn: str(form, "nameEn"), categoryId: str(form, "categoryId") });
  if (!base.success) return fail("يرجى تصحيح الحقول المشار إليها.", zodFields(base.error));
  const variants = rowsSchema(variantRow).safeParse(str(form, "variants"));
  const nutrition = rowsSchema(nutritionRow).safeParse(str(form, "nutrition"));
  if (!variants.success) return fail("بيانات العبوات غير صالحة: كل صف يحتاج اسماً عربياً.");
  if (!nutrition.success) return fail("بيانات القيم الغذائية غير صالحة: كل صف يحتاج اسماً وقيمة.");

  const data = {
    ...base.data,
    descriptionAr: optStr(form, "descriptionAr"),
    descriptionEn: optStr(form, "descriptionEn"),
    ingredientsAr: optStr(form, "ingredientsAr"),
    ingredientsEn: optStr(form, "ingredientsEn"),
    allergensAr: optStr(form, "allergensAr"),
    allergensEn: optStr(form, "allergensEn"),
    storageAr: optStr(form, "storageAr"),
    storageEn: optStr(form, "storageEn"),
    nutrition: nutrition.data.length ? nutrition.data : undefined,
    featured: bool(form, "featured"),
    published: bool(form, "published"),
    sortOrder: int(form, "sortOrder"),
  };

  try {
    if (id) {
      const before = await db.product.findUnique({ where: { id }, include: { variants: true } });
      if (!before) return fail("المنتج غير موجود.");
      await db.$transaction([
        db.product.update({ where: { id }, data: { ...data, nutrition: nutrition.data.length ? nutrition.data : [] } }),
        db.productVariant.deleteMany({ where: { productId: id } }),
        db.productVariant.createMany({
          data: variants.data.map((v, i) => ({ productId: id, labelAr: v.labelAr, labelEn: v.labelEn || null, sortOrder: i })),
        }),
      ]);
      const { variants: oldVariants, ...beforeRest } = before;
      await audit(user.id, "product.update", "Product", id, {
        ...diff(beforeRest as unknown as Record<string, unknown>, data),
        ...(JSON.stringify(oldVariants.map((v) => v.labelAr)) !== JSON.stringify(variants.data.map((v) => v.labelAr))
          ? { variants: { from: oldVariants.map((v) => v.labelAr), to: variants.data.map((v) => v.labelAr) } }
          : {}),
      });
      return { ok: true, message: "تم حفظ المنتج." };
    }
    const created = await db.product.create({
      data: { ...data, variants: { create: variants.data.map((v, i) => ({ labelAr: v.labelAr, labelEn: v.labelEn || null, sortOrder: i })) } },
    });
    await audit(user.id, "product.create", "Product", created.id, { nameAr: created.nameAr });
    return { ok: true, message: "تم إنشاء المنتج. أضف الصور الآن.", redirect: `/admin/products/${created.id}?created=1` };
  } catch (e) {
    if (isUniqueViolation(e)) return fail("الرابط المختصر مستخدم لمنتج آخر.", { slug: "مستخدم مسبقاً" });
    console.error("[product.save]", (e as Error).message);
    return fail("تعذّر حفظ المنتج.");
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const user = await requireUser("catalog");
  const p = await db.product.findUnique({ where: { id } });
  if (!p) return fail("المنتج غير موجود.");
  await db.product.delete({ where: { id } });
  await audit(user.id, "product.delete", "Product", id, { nameAr: p.nameAr, slug: p.slug });
  return { ok: true, redirect: "/admin/products?deleted=1" };
}

export async function uploadProductImages(productId: string, form: FormData): Promise<ActionResult> {
  const user = await requireUser("catalog");
  const files = form.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return fail("اختر صورة واحدة على الأقل.");
  if (files.length > 10) return fail("يمكن رفع 10 صور كحد أقصى في المرة الواحدة.");
  const product = await db.product.findUnique({ where: { id: productId }, include: { images: true } });
  if (!product) return fail("المنتج غير موجود.");
  let order = product.images.reduce((m, i) => Math.max(m, i.sortOrder), -1);
  try {
    for (const f of files) {
      const stored = await storeImage(f, "products");
      await db.media.create({ data: { url: stored.url, key: stored.key, mime: stored.mime, width: stored.width, height: stored.height, size: stored.size } });
      await db.productImage.create({ data: { productId, url: stored.url, altAr: product.nameAr, altEn: product.nameEn, sortOrder: ++order } });
    }
  } catch (e) {
    return fail(uploadMessage(e));
  }
  await audit(user.id, "product.images.upload", "Product", productId, { count: files.length });
  return { ok: true, message: `تم رفع ${files.length} صورة.` };
}

export async function updateProductImage(imageId: string, form: FormData): Promise<ActionResult> {
  const user = await requireUser("catalog");
  const intent = str(form, "intent");
  const img = await db.productImage.findUnique({ where: { id: imageId } });
  if (!img) return fail("الصورة غير موجودة.");
  if (intent === "delete") {
    await db.productImage.delete({ where: { id: imageId } });
    await audit(user.id, "product.images.delete", "Product", img.productId, { url: img.url });
    return { ok: true, message: "تم حذف الصورة." };
  }
  if (intent === "first") {
    const all = await db.productImage.findMany({ where: { productId: img.productId }, orderBy: { sortOrder: "asc" } });
    const ordered = [img, ...all.filter((i) => i.id !== img.id)];
    await db.$transaction(ordered.map((i, idx) => db.productImage.update({ where: { id: i.id }, data: { sortOrder: idx } })));
    return { ok: true, message: "أصبحت الصورة الرئيسية." };
  }
  await db.productImage.update({ where: { id: imageId }, data: { altAr: optStr(form, "altAr"), altEn: optStr(form, "altEn") } });
  return { ok: true, message: "تم حفظ النص البديل." };
}

// ---------- Categories ----------

const categorySchema = z.object({
  slug: slugSchema,
  nameAr: z.string().trim().min(1, "required").max(120, "tooLong"),
  nameEn: z.string().trim().min(1, "required").max(120, "tooLong"),
});

export async function saveCategory(id: string | null, form: FormData): Promise<ActionResult> {
  const user = await requireUser("catalog");
  const parsed = categorySchema.safeParse({ slug: str(form, "slug"), nameAr: str(form, "nameAr"), nameEn: str(form, "nameEn") });
  if (!parsed.success) return fail("يرجى تصحيح الحقول المشار إليها.", zodFields(parsed.error));
  const data = {
    ...parsed.data,
    descriptionAr: optStr(form, "descriptionAr"),
    descriptionEn: optStr(form, "descriptionEn"),
    sortOrder: int(form, "sortOrder"),
    published: bool(form, "published"),
  };
  let imageUrl: string | undefined;
  const file = form.get("image");
  if (file instanceof File && file.size > 0) {
    try {
      const stored = await storeImage(file, "categories");
      await db.media.create({ data: { url: stored.url, key: stored.key, mime: stored.mime, width: stored.width, height: stored.height, size: stored.size } });
      imageUrl = stored.url;
    } catch (e) {
      return fail(uploadMessage(e));
    }
  }
  try {
    if (id) {
      const before = await db.category.findUnique({ where: { id } });
      if (!before) return fail("القسم غير موجود.");
      const updated = await db.category.update({ where: { id }, data: { ...data, ...(imageUrl ? { imageUrl } : {}) } });
      await audit(user.id, "category.update", "Category", id, diff(before as unknown as Record<string, unknown>, updated as unknown as Record<string, unknown>));
      return { ok: true, message: "تم حفظ القسم." };
    }
    const created = await db.category.create({ data: { ...data, imageUrl: imageUrl ?? null } });
    await audit(user.id, "category.create", "Category", created.id, { nameAr: created.nameAr });
    return { ok: true, redirect: `/admin/categories/${created.id}` };
  } catch (e) {
    if (isUniqueViolation(e)) return fail("الرابط المختصر مستخدم لقسم آخر.", { slug: "مستخدم مسبقاً" });
    console.error("[category.save]", (e as Error).message);
    return fail("تعذّر حفظ القسم.");
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const user = await requireUser("catalog");
  const count = await db.product.count({ where: { categoryId: id } });
  if (count > 0) return fail(`لا يمكن حذف قسم يحتوي على ${count} منتج. انقل المنتجات أو أخفِ القسم بدلاً من ذلك.`);
  const c = await db.category.delete({ where: { id } });
  await audit(user.id, "category.delete", "Category", id, { nameAr: c.nameAr });
  return { ok: true, redirect: "/admin/categories" };
}
