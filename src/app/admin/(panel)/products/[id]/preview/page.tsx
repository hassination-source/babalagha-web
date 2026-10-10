import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getProduct } from "@/lib/catalog";
import { siteUrl, type Locale } from "@/lib/i18n";
import { ProductDetail } from "@/components/site/ProductDetail";

export const metadata = { title: "معاينة المنتج" };

/** Renders the public product page for any product, including drafts, inside the admin. */
export default async function PreviewProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ lang?: string }> }) {
  await requireUser("catalog");
  const { id } = await params;
  const { lang } = await searchParams;
  const locale: Locale = lang === "en" ? "en" : "ar";
  const row = await db.product.findUnique({ where: { id }, select: { slug: true, published: true } });
  if (!row) notFound();
  const product = await getProduct(row.slug, { includeUnpublished: true });
  if (!product) notFound();
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-gold bg-gold/15 px-4 py-3 text-sm">
        <span>معاينة {row.published ? "" : "— هذه مسودة غير منشورة"}</span>
        <span className="flex gap-3">
          <Link href={`?lang=${locale === "ar" ? "en" : "ar"}`} className="font-semibold text-seal hover:underline">{locale === "ar" ? "English preview" : "المعاينة العربية"}</Link>
          <Link href={`/admin/products/${id}`} className="font-semibold text-seal hover:underline">العودة للتعديل</Link>
        </span>
      </div>
      <div dir={locale === "ar" ? "rtl" : "ltr"} lang={locale} className="overflow-hidden rounded-lg border border-line bg-flour">
        <ProductDetail product={product} locale={locale} shareUrl={`${siteUrl()}/${locale}/products/${product.slug}`} />
      </div>
    </>
  );
}
