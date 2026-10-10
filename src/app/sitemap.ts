import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/i18n";
import { db } from "@/lib/db";
import { getIndexableGovernorates } from "@/lib/catalog";

export const dynamic = "force-dynamic";

/** One sitemap with hreflang alternates for every Arabic and English URL. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const entry = (path: string, lastModified?: Date, priority = 0.6): MetadataRoute.Sitemap =>
    (["ar", "en"] as const).map((l) => ({
      url: `${base}/${l}${path}`,
      lastModified,
      priority: l === "ar" ? priority : priority - 0.1,
      alternates: { languages: { ar: `${base}/ar${path}`, en: `${base}/en${path}` } },
    }));

  const [categories, products, govs] = await Promise.all([
    db.category.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    db.product.findMany({ where: { published: true, category: { published: true } }, select: { slug: true, updatedAt: true } }),
    getIndexableGovernorates(),
  ]);

  return [
    ...entry("", undefined, 1),
    ...entry("/products", undefined, 0.9),
    ...entry("/about", undefined, 0.8),
    ...entry("/retailers", undefined, 0.9),
    ...entry("/partners", undefined, 0.7),
    ...entry("/contact", undefined, 0.7),
    ...entry("/privacy", undefined, 0.2),
    ...categories.flatMap((c) => entry(`/categories/${c.slug}`, c.updatedAt, 0.8)),
    ...products.flatMap((p) => entry(`/products/${p.slug}`, p.updatedAt, 0.7)),
    ...govs.flatMap((g) => entry(`/retailers/${g}`, undefined, 0.6)),
  ];
}
