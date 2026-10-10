import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, siteUrl } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Catalog, parsePage, parseQ } from "@/components/site/Catalog";
import { Breadcrumbs, JsonLd, PageHero } from "@/components/site/bits";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const sp = await searchParams;
  const t = getDictionary(locale);
  return pageMetadata({
    locale,
    path: "/products",
    title: t.products.title,
    description: t.products.intro,
    noindex: Boolean(sp.q),
  });
}

export default async function ProductsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const sp = await searchParams;
  const t = getDictionary(locale);
  const base = siteUrl();
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: t.common.home, url: `${base}/${locale}` }, { name: t.products.title, url: `${base}/${locale}/products` }])} />
      <PageHero title={t.products.title} intro={t.products.intro}>
        <Breadcrumbs label="Breadcrumb" items={[{ name: t.common.home, href: `/${locale}` }, { name: t.products.title }]} />
      </PageHero>
      <Catalog locale={locale} q={parseQ(sp.q)} page={parsePage(sp.page)} basePath={`/${locale}/products`} />
    </>
  );
}
