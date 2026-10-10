import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, pick, pickOptional, siteUrl } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";
import { getProduct, getRelatedProducts } from "@/lib/catalog";
import { pageMetadata, breadcrumbJsonLd, productJsonLd } from "@/lib/seo";
import { JsonLd, ProductCard } from "@/components/site/bits";
import { ProductDetail } from "@/components/site/ProductDetail";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const p = await getProduct(slug);
  if (!p) return {};
  const name = pick(p, "name", locale);
  const cat = pick(p.category, "name", locale);
  const description =
    pickOptional(p, "description", locale) ??
    (locale === "ar" ? `${name} من قسم ${cat} — مخابز باب الآغا، بغداد منذ 1948.` : `${name} from our ${cat} range — Bab Al Agha Bakeries, Baghdad, since 1948.`);
  return pageMetadata({ locale, path: `/products/${slug}`, title: name, description, image: p.images[0]?.url });
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const product = await getProduct(slug);
  if (!product) notFound();
  const t = getDictionary(locale);
  const related = await getRelatedProducts(product.id, product.categoryId);
  const base = siteUrl();
  const url = `${base}/${locale}/products/${slug}`;
  const name = pick(product, "name", locale);
  const cat = pick(product.category, "name", locale);

  return (
    <>
      <JsonLd
        data={productJsonLd({
          name,
          description: pickOptional(product, "description", locale),
          image: product.images.map((i) => (i.url.startsWith("http") ? i.url : `${base}${i.url}`)),
          url,
          category: cat,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t.common.home, url: `${base}/${locale}` },
          { name: t.products.title, url: `${base}/${locale}/products` },
          { name: cat, url: `${base}/${locale}/categories/${product.category.slug}` },
          { name, url },
        ])}
      />
      <ProductDetail product={product} locale={locale} shareUrl={url} />
      {related.length > 0 && (
        <section className="border-t border-line bg-dough/60 py-14">
          <div className="container-page">
            <h2 className="t-h2 text-seal">{t.products.related}</h2>
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} locale={locale} placeholderLabel={t.common.placeholder} showCategory={false} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
