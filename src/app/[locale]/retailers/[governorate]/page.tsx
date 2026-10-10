import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";
import { pageMetadata } from "@/lib/seo";
import { getIndexableGovernorates } from "@/lib/catalog";
import { governorate as findGov } from "@/lib/iraq";
import { Breadcrumbs, PageHero } from "@/components/site/bits";
import { LocatorPage } from "@/components/site/LocatorPage";

type Props = { params: Promise<{ locale: string; governorate: string }> };

/**
 * One page per governorate, but only for governorates with at least one real, verified, active outlet.
 * This avoids hundreds of thin pages while still letting "باب الآغا في البصرة"-type searches land well.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, governorate } = await params;
  const g = findGov(governorate);
  if (!isLocale(locale) || !g) return {};
  const t = getDictionary(locale);
  const title = t.retailers.governoratePage(g[locale]);
  return pageMetadata({
    locale,
    path: `/retailers/${g.slug}`,
    title,
    description: locale === "ar" ? `منافذ بيع منتجات باب الآغا في محافظة ${g.ar}: العناوين والاتجاهات وأرقام الهواتف.` : `Outlets carrying Bab Al Agha products in ${g.en} governorate: addresses, directions and phone numbers.`,
  });
}

export default async function GovernorateRetailersPage({ params }: Props) {
  const { locale, governorate } = await params;
  if (!isLocale(locale)) notFound();
  const g = findGov(governorate);
  if (!g) notFound();
  const indexable = await getIndexableGovernorates();
  if (!indexable.includes(g.slug)) notFound();
  const t = getDictionary(locale);
  return (
    <>
      <PageHero title={t.retailers.governoratePage(g[locale])} intro={t.retailers.intro}>
        <Breadcrumbs
          label={locale === "ar" ? "مسار التنقل" : "Breadcrumb"}
          items={[{ name: t.common.home, href: `/${locale}` }, { name: t.retailers.title, href: `/${locale}/retailers` }, { name: g[locale] }]}
        />
      </PageHero>
      <LocatorPage locale={locale} governorate={g.slug} />
    </>
  );
}
