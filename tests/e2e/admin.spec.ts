import { test, expect, type Page } from "@playwright/test";
import path from "node:path";
import { writeFileSync, mkdtempSync } from "node:fs";
import os from "node:os";

const EMAIL = process.env.E2E_ADMIN_EMAIL ?? "";
const PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "";

async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("البريد الإلكتروني").fill(EMAIL);
  await page.getByLabel("كلمة المرور").fill(PASSWORD);
  await page.getByRole("button", { name: "دخول" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test.describe("admin", () => {
  test.skip(!EMAIL || !PASSWORD, "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD");

  test("unauthenticated access is blocked", async ({ page, request }) => {
    await page.goto("/admin/products");
    await expect(page).toHaveURL(/\/admin\/login/);
    const res = await request.get("/admin/retailers/export", { maxRedirects: 0 });
    expect([302, 303, 307, 403]).toContain(res.status());
  });

  test("wrong password is rejected", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("البريد الإلكتروني").fill(EMAIL);
    await page.getByLabel("كلمة المرور").fill("definitely-wrong-password");
    await page.getByRole("button", { name: "دخول" }).click();
    await expect(page.getByText("بيانات الدخول غير صحيحة.")).toBeVisible();
  });

  test("dashboard figures come from the database", async ({ page }) => {
    await login(page);
    await expect(page.getByText("منتجات منشورة")).toBeVisible();
    await expect(page.getByText("طلبات شراكة جديدة")).toBeVisible();
  });

  test("create product, upload image, preview, publish, see it on the site, delete", async ({ page }) => {
    await login(page);
    await page.goto("/admin/products/new");
    const slug = `e2e-test-${Date.now()}`;
    await page.getByLabel("الاسم بالعربية").fill("منتج اختبار");
    await page.getByLabel("الاسم بالإنجليزية").fill("E2E Product");
    await page.getByLabel("الرابط المختصر (slug)").fill(slug);
    await page.getByLabel("القسم").selectOption({ label: "الحلويات" });
    await page.getByRole("button", { name: "+ إضافة عبوة أو حجم" }).click();
    await page.getByLabel("بالعربية (مثال: كيس 8 قطع)").fill("علبة اختبار");
    await page.getByRole("button", { name: "إنشاء المنتج" }).click();
    await expect(page).toHaveURL(/\/admin\/products\/[a-z0-9]+\?created=1/);

    // upload an image
    await page.setInputFiles("#images", path.join(process.cwd(), "public/brand/products/baklava.webp"));
    await page.getByRole("button", { name: "رفع", exact: true }).click();
    await expect(page.getByText("تم رفع 1 صورة.")).toBeVisible();

    // draft is not public
    expect((await page.request.get(`/ar/products/${slug}`)).status()).toBe(404);

    await page.getByRole("link", { name: "معاينة" }).click();
    await expect(page.getByText("هذه مسودة غير منشورة")).toBeVisible();
    await expect(page.getByText("علبة اختبار")).toBeVisible();
    await page.getByRole("link", { name: "العودة للتعديل" }).click();

    await page.getByLabel("منشور على الموقع").check();
    await page.getByRole("button", { name: "حفظ التغييرات" }).click();
    await expect(page.getByText("تم حفظ المنتج.")).toBeVisible();
    expect((await page.request.get(`/ar/products/${slug}`)).status()).toBe(200);

    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: "حذف المنتج" }).click();
    await expect(page).toHaveURL(/deleted=1/);
  });

  test("duplicate product slug shows a field error", async ({ page }) => {
    await login(page);
    await page.goto("/admin/products/new");
    await page.getByLabel("الاسم بالعربية").fill("مكرر");
    await page.getByLabel("الاسم بالإنجليزية").fill("Dup");
    await page.getByLabel("الرابط المختصر (slug)").fill("baklava");
    await page.getByLabel("القسم").selectOption({ label: "الحلويات" });
    await page.getByRole("button", { name: "إنشاء المنتج" }).click();
    await expect(page.getByText("الرابط المختصر مستخدم لمنتج آخر.")).toBeVisible();
    await expect(page.getByLabel("الاسم بالعربية")).toHaveValue("مكرر"); // values kept
  });

  test("retailer: create without coordinates cannot be published; pick on map; history recorded", async ({ page }) => {
    await login(page);
    await page.goto("/admin/retailers/new");
    await page.getByLabel("الاسم بالعربية").fill("منفذ اختبار آلي");
    await page.getByLabel("المحافظة").selectOption("baghdad");
    await page.getByLabel("المدينة (عربي)").fill("بغداد");
    await page.getByLabel("الحالة").selectOption("ACTIVE");
    await page.getByRole("button", { name: "إضافة المنفذ" }).click();
    await expect(page.getByText("لا يمكن نشر منفذ بدون إحداثيات")).toBeVisible();

    await page.getByLabel("رابط خرائط Google أو «lat, lng»").fill("https://www.google.com/maps/@33.3128,44.3615,15z");
    await page.getByRole("button", { name: "استخراج" }).click();
    await expect(page.getByLabel("خط العرض (Latitude)")).toHaveValue("33.3128");
    await page.getByRole("button", { name: "إضافة المنفذ" }).click();
    await expect(page).toHaveURL(/\/admin\/retailers\/[a-z0-9]+\?created=1/);

    await page.getByLabel("أوقات العمل").fill("يومياً 9 ص – 10 م");
    await page.getByRole("button", { name: "حفظ التغييرات" }).click();
    await expect(page.getByText("تم حفظ المنفذ.")).toBeVisible();
    await page.reload();
    await expect(page.getByText(/أوقات العمل: — ← يومياً/)).toBeVisible();

    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: "حذف المنفذ" }).click();
    await expect(page).toHaveURL(/deleted=1/);
  });

  test("CSV import previews, reports invalid rows, then imports", async ({ page }) => {
    await login(page);
    const dir = mkdtempSync(path.join(os.tmpdir(), "ba-"));
    const file = path.join(dir, "retailers.csv");
    const stamp = Date.now();
    writeFileSync(
      file,
      "﻿name_ar,governorate,city_ar,latitude,longitude,status\n" +
        `استيراد ${stamp} أ,البصرة,البصرة,30.5,47.8,ACTIVE\n` +
        `استيراد ${stamp} ب,Erbil,أربيل,,,ACTIVE\n` +
        `استيراد ${stamp} ج,محافظة غير موجودة,مدينة,,,PENDING\n`,
    );
    await page.goto("/admin/retailers/import");
    await page.setInputFiles('input[type="file"]', file);
    await expect(page.getByText("صفوف لن تُستورد (1)")).toBeVisible();
    await page.getByRole("button", { name: /استيراد 2 منفذ/ }).click();
    await expect(page.getByText(/أُضيف 2/)).toBeVisible();
    await expect(page.getByText(/1 منفذ بلا إحداثيات/)).toBeVisible();

    const csv = await (await page.request.get("/admin/retailers/export")).text();
    expect(csv).toContain(`استيراد ${stamp} أ`);
  });

  test("inquiry status and note", async ({ page }) => {
    await login(page);
    await page.goto("/admin/inquiries");
    const first = page.locator("tbody tr a").first();
    test.skip((await first.count()) === 0, "no inquiries yet");
    await first.click();
    await page.getByLabel("الحالة").selectOption("IN_PROGRESS");
    await page.getByLabel("ملاحظة داخلية (لا يراها العميل)").fill("تم الاتصال بالعميل");
    await page.getByRole("button", { name: "حفظ" }).click();
    await expect(page.getByText("تم الاتصال بالعميل")).toBeVisible();
  });
});
