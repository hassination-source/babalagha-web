import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { isLocale, pick, pickOptional, siteUrl } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";
import { getCategory } from "@/lib/catalog";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Catalog, parsePage, parseQ } from "@/components/site/Catalog";
import { Breadcrumbs, JsonLd } from "@/components/site/bits";

type Props = { params: Promise<{ locale: string; slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const cat = await getCategory(slug);
  if (!cat) return {};
  const sp = await searchParams;
  const name = pick(cat, "name", locale);
  const desc =
    pickOptional(cat, "description", locale) ??
    (locale === "ar" ? `تشكيلة ${name} من مخابز باب الآغا في بغداد.` : `${name} from Bab Al Agha Bakeries, Baghdad.`);
  return pageMetadata({ locale, path: `/categories/${slug}`, title: name, description: desc, image: cat.imageUrl ?? undefined, noindex: Boolean(sp.q || sp.page) });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const cat = await getCategory(slug);
  if (!cat) notFound();
  const sp = await searchParams;
  const t = getDictionary(locale);
  const name = pick(cat, "name", locale);
  const desc = pickOptional(cat, "description", locale);
  const base = siteUrl();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t.common.home, url: `${base}/${locale}` },
          { name: t.products.title, url: `${base}/${locale}/products` },
          { name, url: `${base}/${locale}/categories/${slug}` },
        ])}
      />
      <section className="border-b border-line bg-seal text-flour">
        <div className="container-page grid items-end gap-8 py-10 md:grid-cols-12 md:py-14">
          <div className="md:col-span-7">
            <div className="text-flour/70 [&_a:hover]:text-flour [&_span[aria-current]]:text-flour">
              <Breadcrumbs label="Breadcrumb" items={[{ name: t.common.home, href: `/${locale}` }, { name: t.products.title, href: `/${locale}/products` }, { name }]} />
            </div>
            <h1 className="t-display mt-6">{name}</h1>
            {desc && <p className="mt-4 max-w-xl text-lg text-flour/85">{desc}</p>}
          </div>
          {cat.imageUrl && (
            <div className="arch relative hidden aspect-[5/4] md:col-span-4 md:col-start-9 md:block">
              <Image src={cat.imageUrl} alt="" fill priority sizes="33vw" className="object-cover" />
            </div>
          )}
        </div>
      </section>
      <Catalog locale={locale} category={slug} q={parseQ(sp.q)} page={parsePage(sp.page)} basePath={`/${locale}/categories/${slug}`} />
    </>
  );
}
