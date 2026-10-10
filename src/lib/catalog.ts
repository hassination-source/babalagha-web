import "server-only";
import { cache } from "react";
import { Prisma } from "@prisma/client";
import { db } from "./db";

export const PAGE_SIZE = 12;

/** Arabic search normalisation: unify alef/yaa/taa-marbuta forms and strip tashkeel. */
export function normalizeArabic(s: string): string {
  return s
    .replace(/[ً-ْـ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .trim()
    .toLowerCase();
}

const NORMALIZE_SQL = (col: string) =>
  Prisma.raw(`lower(translate(${col}, 'أإآىة', 'ااايه'))`);

export const getCategories = cache(async () =>
  db.category.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { published: true } } } } },
  }),
);

export async function getCategory(slug: string) {
  return db.category.findFirst({ where: { slug, published: true } });
}

const productInclude = {
  category: { select: { slug: true, nameAr: true, nameEn: true } },
  images: { orderBy: { sortOrder: "asc" }, take: 1 },
} satisfies Prisma.ProductInclude;

export type ProductCardData = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

export async function searchProducts(opts: { q?: string; category?: string; page?: number }) {
  const page = Math.max(1, opts.page ?? 1);
  const where: Prisma.ProductWhereInput = {
    published: true,
    category: { published: true, ...(opts.category ? { slug: opts.category } : {}) },
  };

  const q = opts.q?.trim().slice(0, 80);
  if (q) {
    const term = `%${normalizeArabic(q).replace(/[%_\\]/g, "")}%`;
    const ids = await db.$queryRaw<{ id: string }[]>`
      SELECT id FROM "Product"
      WHERE published = true AND (
        ${NORMALIZE_SQL('"nameAr"')} LIKE ${term} OR lower("nameEn") LIKE ${term}
        OR ${NORMALIZE_SQL(`coalesce("descriptionAr", '')`)} LIKE ${term}
        OR lower(coalesce("descriptionEn", '')) LIKE ${term}
      )`;
    where.id = { in: ids.map((r) => r.id) };
  }

  const [total, items] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      include: productInclude,
      orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }, { nameAr: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);
  return { items, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getFeaturedProducts(limit = 8) {
  return db.product.findMany({
    where: { published: true, featured: true, category: { published: true } },
    include: productInclude,
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    take: limit,
  });
}

export async function getProduct(slug: string, opts: { includeUnpublished?: boolean } = {}) {
  return db.product.findFirst({
    where: { slug, ...(opts.includeUnpublished ? {} : { published: true, category: { published: true } }) },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getRelatedProducts(productId: string, categoryId: string, limit = 4) {
  return db.product.findMany({
    where: { published: true, categoryId, id: { not: productId } },
    include: productInclude,
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
    take: limit,
  });
}

/** Public retailer fields only — submitter details are never selected. */
export const publicRetailerSelect = {
  id: true,
  nameAr: true,
  nameEn: true,
  type: true,
  governorate: true,
  cityAr: true,
  cityEn: true,
  districtAr: true,
  districtEn: true,
  addressAr: true,
  addressEn: true,
  latitude: true,
  longitude: true,
  phone: true,
  openingHours: true,
  notesAr: true,
  notesEn: true,
  verified: true,
  isDemo: true,
} satisfies Prisma.RetailerSelect;

export type PublicRetailer = Prisma.RetailerGetPayload<{ select: typeof publicRetailerSelect }>;

export async function getPublicRetailers(opts: { showDemo: boolean; governorate?: string }) {
  return db.retailer.findMany({
    where: {
      status: "ACTIVE",
      ...(opts.showDemo ? {} : { isDemo: false }),
      ...(opts.governorate ? { governorate: opts.governorate } : {}),
    },
    select: publicRetailerSelect,
    orderBy: [{ governorate: "asc" }, { cityAr: "asc" }, { nameAr: "asc" }],
  });
}

/** Governorates that have at least one real, verified, active outlet — only these get indexable pages. */
export async function getIndexableGovernorates() {
  const rows = await db.retailer.groupBy({
    by: ["governorate"],
    where: { status: "ACTIVE", verified: true, isDemo: false },
    _count: true,
  });
  return rows.filter((r) => r._count > 0).map((r) => r.governorate);
}
