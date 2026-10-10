import { test, expect } from "@playwright/test";

test.describe("public site", () => {
  test("root redirects to Arabic, RTL is set, nav works @mobile", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/ar$/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("1948");
  });

  test("English version is LTR with its own metadata and hreflang", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page).toHaveTitle(/Bab Al Agha/);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toMatch(/\/en$/);
    await expect(page.locator('link[rel="alternate"][hreflang="ar"]')).toHaveCount(1);
  });

  test("language switcher keeps the current page", async ({ page }) => {
    await page.goto("/ar/about");
    await page.getByRole("link", { name: "Switch to English" }).first().click();
    await expect(page).toHaveURL(/\/en\/about$/);
  });

  test("product search finds Arabic and English names and handles empty results", async ({ page }) => {
    await page.goto("/ar/products?q=كليجه"); // taa-marbuta normalisation
    await expect(page.getByRole("link", { name: "كليجة بالجوز" })).toBeVisible();
    await page.goto("/en/products?q=baklava");
    await expect(page.getByRole("link", { name: "Baklava", exact: true })).toBeVisible();
    await page.goto("/ar/products?q=zzzznotaproduct");
    await expect(page.getByText("لا توجد منتجات تطابق بحثك.")).toBeVisible();
  });

  test("category and product detail pages render with structured data", async ({ page }) => {
    await page.goto("/ar/categories/oriental-sweets");
    await expect(page.getByRole("link", { name: "بقلاوة", exact: true })).toHaveAttribute("href", "/ar/products/baklava");
    await page.goto("/ar/products/baklava");
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    const product = ld.map((t) => JSON.parse(t)).find((d) => d["@type"] === "Product");
    expect(product?.name).toBe("بقلاوة");
    expect(product?.offers).toBeUndefined();
    expect(product?.aggregateRating).toBeUndefined();
  });

  test("retailer locator filters, selects and offers directions @mobile", async ({ page, isMobile }) => {
    await page.goto("/ar/retailers");
    await expect(page.getByRole("note")).toContainText("بيانات تجريبية");
    await page.locator("#loc-gov").selectOption("basra");
    await page.getByLabel("ابحث بالمدينة أو الحي أو اسم المنفذ").fill("العشار");
    await expect(page.getByText("منفذ واحد")).toBeVisible();
    await page.getByRole("listitem").getByRole("button", { name: /العشار/ }).click();
    await expect(page.getByRole("link", { name: "الاتجاهات" })).toHaveAttribute("href", /google\.com\/maps\/dir/);
    await page.getByRole("button", { name: "العودة إلى النتائج" }).click();
    await page.getByLabel("ابحث بالمدينة أو الحي أو اسم المنفذ").fill("غير موجود ابدا");
    await expect(page.getByText("لا يوجد منفذ مسجّل يطابق بحثك حتى الآن.")).toBeVisible();
    if (!isMobile) await expect(page.locator(".leaflet-container")).toBeVisible();
  });

  test("contact form validates on the server and only confirms after saving", async ({ page }) => {
    await page.goto("/ar/contact");
    await page.waitForTimeout(3200); // spam timing token requires >3s
    await page.getByRole("button", { name: "إرسال" }).click();
    await expect(page.getByText("يرجى تصحيح الحقول المشار إليها.")).toBeVisible();
    await page.getByLabel("الاسم").fill("اختبار آلي");
    await page.getByLabel("رقم الهاتف").fill("0780 123 4567");
    await page.getByLabel("الرسالة").fill("هذه رسالة اختبار آلية من مجموعة الاختبارات.");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "إرسال" }).click();
    await expect(page.getByRole("status")).toContainText("تم استلام رسالتك");
  });

  test("partner form submits", async ({ page }) => {
    await page.goto("/en/partners");
    await page.waitForTimeout(3200);
    await page.getByLabel("Business name").fill("E2E Test Market");
    await page.getByLabel("Contact person").fill("Test Person");
    await page.getByLabel("Phone number").fill("07701234567");
    await page.getByLabel("Governorate").selectOption("basra");
    await page.getByLabel("City & district").fill("Basra, Ashar");
    await page.getByLabel("Business type").selectOption("supermarket");
    await page.getByLabel("Current business location").fill("Near the corniche");
    await page.getByLabel("Sweets").check();
    await page.getByRole("checkbox", { name: /privacy/ }).check();
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByRole("status")).toContainText("received");
  });

  test("submissions with a tampered or missing timing token are rejected", async ({ page }) => {
    await page.goto("/ar/contact");
    await page.getByLabel("الاسم").fill("روبوت");
    await page.getByLabel("رقم الهاتف").fill("07801234567");
    await page.getByLabel("الرسالة").fill("رسالة يجب أن تُرفض لأن رمز التحقق مزوّر.");
    await page.getByRole("checkbox").check();
    await page.evaluate(() => {
      (document.querySelector('input[name="_t"]') as HTMLInputElement).value = `${Date.now() - 60000}.forged`;
    });
    await page.getByRole("button", { name: "إرسال" }).click();
    await expect(page.getByText("تعذّر التحقق من الطلب")).toBeVisible();
  });

  test("sitemap and robots are served", async ({ request }) => {
    const sm = await request.get("/sitemap.xml");
    expect(sm.ok()).toBeTruthy();
    const body = await sm.text();
    expect(body).toContain("/ar/products/baklava");
    expect(body).toContain('hreflang="en"');
    expect(body).not.toContain("/retailers/baghdad"); // demo outlets never create indexable pages
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /admin");
  });

  test("unknown pages return 404", async ({ request }) => {
    expect((await request.get("/ar/products/not-a-real-product")).status()).toBe(404);
    expect((await request.get("/en/categories/nope")).status()).toBe(404);
  });
});
