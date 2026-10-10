/**
 * Seeds the database with:
 *  - REAL catalogue data from the official website (categories, products, package text, photos),
 *  - REAL timeline milestones from the official About page,
 *  - REAL brand photography for the social gallery,
 *  - DEMO retailers, clearly flagged with isDemo=true and "[تجريبي]" in their names.
 *
 * Safe to re-run: catalogue rows are upserted by slug; demo retailers are replaced.
 * Usage: npm run db:seed            (add SEED_DEMO_RETAILERS=false to skip demo outlets)
 */
import { PrismaClient } from "@prisma/client";
import { officialCategories, officialProducts, officialTimeline } from "../src/data/official-catalog";
import { translatePackage } from "../src/lib/packages";

const db = new PrismaClient();

const GALLERY_PICKS = [
  { file: "gallery-07", ar: "صواني الحلويات الشرقية في باب الآغا", en: "Trays of oriental sweets at Bab Al Agha" },
  { file: "gallery-21", ar: "سلال الخبز والمعجنات", en: "Baskets of bread and pastries" },
  { file: "gallery-15", ar: "جلسات بطابع بغدادي داخل باب الآغا", en: "Baghdadi-style seating inside Bab Al Agha" },
  { file: "gallery-12", ar: "بقلاوة بالفستق", en: "Pistachio baklava" },
  { file: "gallery-22", ar: "ركن الحلويات", en: "The sweets counter" },
  { file: "gallery-10", ar: "واجهة باب الآغا ليلاً", en: "The Bab Al Agha façade at night" },
];

/** Demo outlets — fictional, for development only. Coordinates are generic neighbourhood points. */
const DEMO_RETAILERS = [
  { nameAr: "[تجريبي] سوبرماركت نموذجي — الكرادة", nameEn: "[Demo] Sample Supermarket — Karrada", type: "SUPERMARKET", governorate: "baghdad", cityAr: "بغداد", cityEn: "Baghdad", districtAr: "الكرادة", districtEn: "Karrada", lat: 33.3062, lng: 44.4234 },
  { nameAr: "[تجريبي] أسواق نموذجية — المنصور", nameEn: "[Demo] Sample Market — Mansour", type: "SUPERMARKET", governorate: "baghdad", cityAr: "بغداد", cityEn: "Baghdad", districtAr: "المنصور", districtEn: "Mansour", lat: 33.3155, lng: 44.3462 },
  { nameAr: "[تجريبي] محل مواد غذائية — زيونة", nameEn: "[Demo] Sample Grocery — Zayouna", type: "GROCERY", governorate: "baghdad", cityAr: "بغداد", cityEn: "Baghdad", districtAr: "زيونة", districtEn: "Zayouna", lat: 33.3248, lng: 44.4573 },
  { nameAr: "[تجريبي] موزّع نموذجي — الدورة", nameEn: "[Demo] Sample Distributor — Dora", type: "DISTRIBUTOR", governorate: "baghdad", cityAr: "بغداد", cityEn: "Baghdad", districtAr: "الدورة", districtEn: "Dora", lat: 33.2547, lng: 44.4058 },
  { nameAr: "[تجريبي] سوبرماركت نموذجي — العشار", nameEn: "[Demo] Sample Supermarket — Ashar", type: "SUPERMARKET", governorate: "basra", cityAr: "البصرة", cityEn: "Basra", districtAr: "العشار", districtEn: "Ashar", lat: 30.5115, lng: 47.8138 },
  { nameAr: "[تجريبي] أسواق نموذجية — عينكاوة", nameEn: "[Demo] Sample Market — Ankawa", type: "SUPERMARKET", governorate: "erbil", cityAr: "أربيل", cityEn: "Erbil", districtAr: "عينكاوة", districtEn: "Ankawa", lat: 36.2355, lng: 43.9939 },
  { nameAr: "[تجريبي] تاجر جملة نموذجي — النجف", nameEn: "[Demo] Sample Wholesaler — Najaf", type: "WHOLESALER", governorate: "najaf", cityAr: "النجف", cityEn: "Najaf", districtAr: null, districtEn: null, lat: 32.0259, lng: 44.3462 },
  { nameAr: "[تجريبي] محل مواد غذائية — الحلة", nameEn: "[Demo] Sample Grocery — Hilla", type: "GROCERY", governorate: "babil", cityAr: "الحلة", cityEn: "Hilla", districtAr: null, districtEn: null, lat: 32.4637, lng: 44.4199 },
] as const;

async function main() {
  // Categories
  for (const c of officialCategories) {
    await db.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        slug: c.slug,
        nameAr: c.nameAr,
        nameEn: c.nameEn,
        descriptionAr: c.taglineAr ?? null,
        imageUrl: `/brand/categories/${c.slug}.webp`,
        sortOrder: c.order,
        published: true,
      },
    });
  }
  const cats = new Map((await db.category.findMany()).map((c) => [c.slug, c.id]));

  // Products
  let i = 0;
  for (const p of officialProducts) {
    i++;
    const existing = await db.product.findUnique({ where: { slug: p.slug } });
    if (existing) continue; // never overwrite edits made in the admin
    await db.product.create({
      data: {
        slug: p.slug,
        nameAr: p.nameAr,
        nameEn: p.nameEn,
        categoryId: cats.get(p.category)!,
        featured: Boolean(p.featured),
        published: true,
        sortOrder: i,
        images: { create: [{ url: `/brand/products/${p.slug}.webp`, altAr: p.nameAr, altEn: p.nameEn, sortOrder: 0 }] },
        variants: p.packageAr ? { create: [{ labelAr: p.packageAr, labelEn: translatePackage(p.packageAr), sortOrder: 0 }] } : undefined,
      },
    });
  }

  // Timeline
  if ((await db.timelineEntry.count()) === 0) {
    await db.timelineEntry.createMany({
      data: officialTimeline.map((e, idx) => ({ ...e, sortOrder: idx, published: true })),
    });
  }

  // Gallery
  if ((await db.galleryImage.count()) === 0) {
    await db.galleryImage.createMany({
      data: GALLERY_PICKS.map((g, idx) => ({ url: `/brand/gallery/${g.file}.webp`, altAr: g.ar, altEn: g.en, sortOrder: idx, published: true })),
    });
  }

  // Demo retailers
  await db.retailer.deleteMany({ where: { isDemo: true } });
  if (process.env.SEED_DEMO_RETAILERS !== "false") {
    for (const r of DEMO_RETAILERS) {
      await db.retailer.create({
        data: {
          nameAr: r.nameAr,
          nameEn: r.nameEn,
          type: r.type,
          governorate: r.governorate,
          cityAr: r.cityAr,
          cityEn: r.cityEn,
          districtAr: r.districtAr,
          districtEn: r.districtEn,
          addressAr: "عنوان تجريبي لأغراض التطوير",
          addressEn: "Demo address for development",
          latitude: r.lat,
          longitude: r.lng,
          notesAr: "سجلّ تجريبي — ليس منفذاً حقيقياً.",
          notesEn: "Demo record — not a real outlet.",
          status: "ACTIVE",
          verified: false,
          isDemo: true,
        },
      });
    }
    await db.retailer.create({
      data: {
        nameAr: "[تجريبي] طلب إضافة متجر — الأعظمية",
        type: "OTHER",
        governorate: "baghdad",
        cityAr: "بغداد",
        districtAr: "الأعظمية",
        addressAr: "طلب تجريبي لاختبار شاشة المراجعة",
        status: "PENDING",
        isDemo: true,
        submittedBy: "مستخدم تجريبي",
        submitterPhone: "+9647000000000",
      },
    });
  }

  const counts = {
    categories: await db.category.count(),
    products: await db.product.count(),
    timeline: await db.timelineEntry.count(),
    gallery: await db.galleryImage.count(),
    demoRetailers: await db.retailer.count({ where: { isDemo: true } }),
  };
  console.log("Seed complete:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
