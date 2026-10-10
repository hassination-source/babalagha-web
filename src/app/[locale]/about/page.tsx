import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, pick, siteUrl } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";
import { getContent } from "@/lib/content";
import { db } from "@/lib/db";
import { pageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs, JsonLd } from "@/components/site/bits";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  const c = await getContent(locale);
  return pageMetadata({ locale, path: "/about", title: `${t.about.title} — ${t.about.lead}`, description: c("home.story.body").slice(0, 160), image: "/brand/archivalBakers.webp" });
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const c = await getContent(locale);
  const timeline = await db.timelineEntry.findMany({ where: { published: true }, orderBy: [{ year: "asc" }, { sortOrder: "asc" }] });
  const base = siteUrl();

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: t.common.home, url: `${base}/${locale}` }, { name: t.about.title, url: `${base}/${locale}/about` }])} />

      <section className="bg-seal text-flour">
        <div className="container-page grid gap-10 pb-0 pt-10 md:grid-cols-12 md:pt-14">
          <div className="md:col-span-6 md:pb-16">
            <div className="text-flour/70 [&_a:hover]:text-flour [&_span[aria-current]]:text-flour">
              <Breadcrumbs label={locale === "ar" ? "مسار التنقل" : "Breadcrumb"} items={[{ name: t.common.home, href: `/${locale}` }, { name: t.about.title }]} />
            </div>
            <p className="mt-10 font-semibold text-gold">{t.about.eyebrow}</p>
            <h1 className="t-display mt-2">{t.about.lead}</h1>
            <p className="mt-6 max-w-[36rem] text-lg leading-[1.95] text-flour/85">{c("home.story.body")}</p>
            <p className="mt-6 font-[family-name:var(--font-ruqaa)] text-2xl text-gold" lang="ar">{c("brand.slogan")}</p>
          </div>
          <div className="relative self-end md:col-span-5 md:col-start-8">
            <div className="arch relative aspect-[4/5]">
              <Image src="/brand/archivalBakers.webp" alt={locale === "ar" ? "صورة أرشيفية لخبّازين أمام صفوف الصمون" : "Archival photo of bakers behind rows of samoon"} fill priority sizes="(min-width: 768px) 40vw, 100vw" className="object-cover grayscale" />
            </div>
          </div>
        </div>
      </section>
      <div className="kashi-band" aria-hidden />

      {/* Timeline */}
      <section className="container-page py-16 md:py-24">
        <div className="max-w-2xl">
          <h2 className="t-h2 text-seal">{t.about.timelineTitle}</h2>
          <p className="t-lead mt-3">{t.about.timelineIntro}</p>
        </div>
        <ol className="relative mt-12 border-s-2 border-gold/50 ps-8 md:ms-[7.5rem] md:ps-10">
          {timeline.map((e) => (
            <li key={e.id} className="relative pb-10 last:pb-0">
              <span aria-hidden className="absolute -start-[2.6rem] top-2 size-4 rounded-full border-[3px] border-flour bg-seal ring-2 ring-gold md:-start-[3.1rem]" />
              <div className="md:grid md:grid-cols-[1fr] md:gap-1">
                <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-crust md:absolute md:-start-[10rem] md:top-0 md:w-24 md:text-end">{e.year}</p>
                <h3 className="t-h3 mt-1 text-seal md:mt-0">{pick(e, "title", locale)}</h3>
                {(e.placeAr || e.placeEn) && <p className="text-muted">{pick(e, "place", locale)}</p>}
              </div>
              {e.imageUrl && (
                <div className="relative mt-4 aspect-[16/9] max-w-md overflow-hidden rounded-[var(--radius-soft)]">
                  <Image src={e.imageUrl} alt="" fill sizes="28rem" className="object-cover" />
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* Today */}
      <section className="bg-dough/70 py-16 md:py-24">
        <div className="container-page grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <h2 className="t-h2 text-seal">{t.about.todayTitle}</h2>
            <p className="mt-5 text-lg leading-[1.9]">{t.about.todayBody}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/${locale}/products`} className="btn btn-primary">{t.cta.discoverProducts}</Link>
              <Link href={`/${locale}/contact`} className="btn btn-ghost text-seal">{t.nav.contact}</Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:col-span-7">
            <div className="relative col-span-2 aspect-[16/9] overflow-hidden rounded-[var(--radius-soft)]">
              <Image src="/brand/facade.webp" alt={locale === "ar" ? "واجهة مخابز باب الآغا" : "The Bab Al Agha bakery façade"} fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-soft)]">
              <Image src="/brand/gallery/gallery-22.webp" alt={locale === "ar" ? "ركن الحلويات" : "The sweets counter"} fill sizes="(min-width: 768px) 27vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-soft)]">
              <Image src="/brand/gallery/gallery-24.webp" alt={locale === "ar" ? "داخل المخبز" : "Inside the bakery"} fill sizes="(min-width: 768px) 27vw, 50vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container-page py-16 md:py-24">
        <h2 className="t-h2 text-seal">{t.about.valuesTitle}</h2>
        <dl className="mt-10 grid gap-10 md:grid-cols-3">
          {t.about.values.map((v) => (
            <div key={v.t} className="border-t-2 border-seal pt-5">
              <dt className="t-h3 text-seal">{v.t}</dt>
              <dd className="mt-2 text-muted">{v.d}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-16 max-w-3xl font-[family-name:var(--font-display)] text-2xl leading-relaxed text-seal md:text-3xl">{c("about.closing")}</p>
      </section>
    </>
  );
}
