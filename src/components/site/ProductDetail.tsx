import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { pick, pickOptional } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";
import type { getProduct } from "@/lib/catalog";
import { Breadcrumbs } from "./bits";
import { ProductGallery } from "./ProductGallery";

type Product = NonNullable<Awaited<ReturnType<typeof getProduct>>>;
type NutritionRow = { labelAr: string; labelEn?: string; value: string };

export function ProductDetail({ product, locale, shareUrl }: { product: Product; locale: Locale; shareUrl: string }) {
  const t = getDictionary(locale);
  const name = pick(product, "name", locale);
  const other = locale === "ar" ? product.nameEn : product.nameAr;
  const description = pickOptional(product, "description", locale);
  const ingredients = pickOptional(product, "ingredients", locale);
  const allergens = pickOptional(product, "allergens", locale);
  const storage = pickOptional(product, "storage", locale);
  const nutrition = Array.isArray(product.nutrition) ? (product.nutrition as NutritionRow[]) : [];
  const hasInfo = Boolean(ingredients || allergens || storage || nutrition.length);
  const catName = pick(product.category, "name", locale);
  const images = product.images.map((im) => ({ url: im.url, alt: pick(im, "alt", locale) || name }));

  return (
    <div className="container-page py-8 md:py-12">
      <Breadcrumbs
        label={locale === "ar" ? "مسار التنقل" : "Breadcrumb"}
        items={[
          { name: t.common.home, href: `/${locale}` },
          { name: t.products.title, href: `/${locale}/products` },
          { name: catName, href: `/${locale}/categories/${product.category.slug}` },
          { name },
        ]}
      />
      <div className="mt-6 grid gap-10 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-7">
          <ProductGallery images={images} label={t.products.gallery} placeholder={t.common.placeholder} />
        </div>
        <div className="md:col-span-5 md:pt-4">
          <Link href={`/${locale}/categories/${product.category.slug}`} className="t-kicker hover:underline">{catName}</Link>
          <h1 className="t-display mt-2 text-seal">{name}</h1>
          {other && <p className="mt-1 text-lg text-muted" lang={locale === "ar" ? "en" : "ar"}>{other}</p>}
          {description && <p className="mt-6 text-lg leading-[1.9]">{description}</p>}

          {product.variants.length > 0 && (
            <div className="mt-8">
              <h2 className="text-base font-semibold text-ink">{t.products.packages}</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <li key={v.id} className="rounded-full border border-line bg-white px-4 py-2 text-[0.95rem]">{pick(v, "label", locale)}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/${locale}/retailers`} className="btn btn-primary">{t.cta.findRetailer}</Link>
            <Link href={`/${locale}/contact?kind=PRODUCT&product=${encodeURIComponent(product.slug)}`} className="btn btn-ghost text-seal">{t.cta.askAboutProduct}</Link>
          </div>
          <p className="mt-5 text-sm">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${name} — ${shareUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline text-muted"
            >
              {locale === "ar" ? "شارك عبر واتساب" : "Share on WhatsApp"}
            </a>
          </p>

          <div className="mt-10 divide-y divide-line border-y border-line">
            {ingredients && <InfoRow title={t.products.ingredients}>{ingredients}</InfoRow>}
            {allergens && <InfoRow title={t.products.allergens}>{allergens}</InfoRow>}
            {nutrition.length > 0 && (
              <InfoRow title={t.products.nutrition}>
                <table className="w-full text-[0.95rem]">
                  <tbody>
                    {nutrition.map((r, i) => (
                      <tr key={i} className="border-b border-line/60 last:border-0">
                        <th scope="row" className="py-1.5 text-start font-normal text-muted">{locale === "en" ? r.labelEn || r.labelAr : r.labelAr}</th>
                        <td className="py-1.5 text-end" dir="ltr">{r.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </InfoRow>
            )}
            {storage && <InfoRow title={t.products.storage}>{storage}</InfoRow>}
            {!hasInfo && <p className="py-4 text-sm text-muted">{t.products.infoPending}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group py-4" open>
      <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between font-semibold">
        {title}
        <span aria-hidden className="text-muted transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="mt-2 whitespace-pre-line text-[0.97rem] text-ink/85">{children}</div>
    </details>
  );
}
