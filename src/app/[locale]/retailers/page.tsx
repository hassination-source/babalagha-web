import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";
import { pageMetadata } from "@/lib/seo";
import { getIndexableGovernorates } from "@/lib/catalog";
import { GOVERNORATES } from "@/lib/iraq";
import { Breadcrumbs, PageHero } from "@/components/site/bits";
import { LocatorPage } from "@/components/site/LocatorPage";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return pageMetadata({
    locale,
    path: "/retailers",
    title: t.retailers.title,
    description: locale === "ar" ? "اعثر على أقرب منفذ بيع لمنتجات باب الآغا في بغداد وجميع محافظات العراق." : "Find the nearest outlet for Bab Al Agha products in Baghdad and across Iraq's governorates.",
  });
}

export default async function RetailersPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const indexable = await getIndexableGovernorates();
  return (
    <>
      <PageHero title={t.retailers.title} intro={t.retailers.intro}>
        <Breadcrumbs label={locale === "ar" ? "مسار التنقل" : "Breadcrumb"} items={[{ name: t.common.home, href: `/${locale}` }, { name: t.retailers.title }]} />
      </PageHero>
      <LocatorPage locale={locale} />
      {indexable.length > 0 && (
        <nav className="container-page pb-14" aria-label={t.retailers.governorate}>
          <ul className="flex flex-wrap gap-2">
            {GOVERNORATES.filter((g) => indexable.includes(g.slug)).map((g) => (
              <li key={g.slug}>
                <Link href={`/${locale}/retailers/${g.slug}`} className="link-underline text-seal">{t.retailers.governoratePage(g[locale])}</Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}
