import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, pick, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";
import { getContent, getSettings } from "@/lib/content";
import { getCategories, getFeaturedProducts, getPublicRetailers } from "@/lib/catalog";
import { db } from "@/lib/db";
import { pageMetadata } from "@/lib/seo";
import { GOVERNORATES } from "@/lib/iraq";
import { Photo, ProductCard } from "@/components/site/bits";
import { HomeRetailerMap } from "@/components/map/HomeRetailerMap";
import { SocialIcon } from "@/components/site/SocialIcon";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const c = await getContent(locale);
  return {
    ...pageMetadata({
      locale,
      path: "/",
      title: locale === "ar" ? "مخابز باب الآغا | خبز عراقي أصيل منذ 1948" : "Bab Al Agha Bakeries | Authentic Iraqi bread since 1948",
      description: c("home.hero.subtitle"),
    }),
    title: { absolute: locale === "ar" ? "مخابز باب الآغا | خبز عراقي أصيل منذ 1948" : "Bab Al Agha Bakeries | Authentic Iraqi bread since 1948" },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale: l } = await params;
  if (!isLocale(l)) notFound();
  const locale: Locale = l;
  const t = getDictionary(locale);
  const [c, s, categories, featured, timeline, gallery] = await Promise.all([
    getContent(locale),
    getSettings(),
    getCategories(),
    getFeaturedProducts(8),
    db.timelineEntry.findMany({ where: { published: true }, orderBy: [{ year: "asc" }, { sortOrder: "asc" }] }),
    db.galleryImage.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" }, take: 6 }),
  ]);
  const retailers = await getPublicRetailers({ showDemo: s("locator.showDemo") === "true" });
  const points = retailers
    .filter((r) => r.latitude !== null && r.longitude !== null)
    .map((r) => ({ id: r.id, lat: r.latitude!, lng: r.longitude!, label: pick(r, "name", locale), demo: r.isDemo }));
  const govsWithRetailers = GOVERNORATES.filter((g) => retailers.some((r) => r.governorate === g.slug));
  const hasDemo = retailers.some((r) => r.isDemo);
  const ph = t.common.placeholder;

  const [leadCat, ...restCats] = categories;
  const firstYear = timeline[0]?.year;
  const lastYear = timeline.at(-1)?.year;

  return (
    <>
      {/* 1 — Hero */}
      <section className="relative overflow-hidden">
        <div className="container-page grid items-center gap-10 pb-14 pt-8 md:grid-cols-12 md:gap-8 md:pb-20 md:pt-14">
          <div className="hero-enter order-2 md:order-1 md:col-span-6 lg:col-span-6">
            <p className="t-kicker">{c("home.hero.eyebrow")}</p>
            <h1 className="t-display mt-3 text-seal">{c("home.hero.title")}</h1>
            <p className="t-lead mt-5">{c("home.hero.subtitle")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/${locale}/products`} className="btn btn-primary">{t.cta.discoverProducts}</Link>
              <Link href={`/${locale}/retailers`} className="btn btn-ghost text-seal">{t.cta.findRetailer}</Link>
            </div>
          </div>
          <div className="relative order-1 md:order-2 md:col-span-6 lg:col-span-5 lg:col-start-8">
            <div className="arch hero-photo relative aspect-[4/5] w-full max-md:mx-auto max-md:max-w-[26rem]">
              <Image
                src={s("home.hero.image")}
                alt={locale === "ar" ? "خبز باب الآغا الطازج مع سنابل القمح" : "Fresh Bab Al Agha bread with ears of wheat"}
                fill
                priority
                sizes="(min-width: 768px) 45vw, 90vw"
                className="object-cover"
              />
            </div>
            <Image
              src="/brand/logo-seal.png"
              alt=""
              width={140}
              height={140}
              className="absolute -bottom-6 start-2 size-24 drop-shadow-[0_8px_18px_rgba(51,18,11,0.28)] md:-start-8 md:size-32"
            />
          </div>
        </div>
      </section>

      <div className="kashi-band" aria-hidden />

      {/* 2 — Heritage */}
      <section className="bg-seal text-flour">
        <div className="container-page grid gap-12 py-16 md:grid-cols-12 md:py-24">
          <figure className="md:col-span-5">
            <div className="relative aspect-[530/600] overflow-hidden rounded-[var(--radius-soft)]">
              <Image src="/brand/archivalBakers.webp" alt={locale === "ar" ? "صورة أرشيفية لخبّازين في أحد أفران بغداد" : "Archival photo of bakers in a Baghdad bakery"} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover grayscale" />
            </div>
            <figcaption className="mt-3 text-sm text-flour/60">{locale === "ar" ? "من أرشيف باب الآغا" : "From the Bab Al Agha archive"}</figcaption>
          </figure>
          <div className="md:col-span-6 md:col-start-7 md:pt-6">
            <p className="text-[0.95rem] font-semibold text-gold">{t.home.storyEyebrow}</p>
            <h2 className="t-h2 mt-2">{c("home.story.title")}</h2>
            <p className="mt-6 max-w-[36rem] text-lg leading-[1.95] text-flour/85">{c("home.story.body")}</p>
            <p className="mt-6 font-[family-name:var(--font-ruqaa)] text-2xl leading-relaxed text-gold" lang="ar">{c("brand.slogan")}</p>
            <Link href={`/${locale}/about`} className="btn btn-gold mt-8">{t.cta.ourStory}</Link>
          </div>
        </div>
        {timeline.length > 0 && (
          <div className="border-t border-flour/10">
            <ol className="container-page flex snap-x gap-0 overflow-x-auto py-8 [scrollbar-width:thin]" aria-label={locale === "ar" ? "محطات من رحلتنا" : "Milestones"}>
              {timeline.map((e, i) => (
                <li key={e.id} className="relative min-w-[11.5rem] snap-start pe-6">
                  <span className="block font-[family-name:var(--font-display)] text-3xl text-gold">{e.year}</span>
                  <span className="mt-1 block text-[0.95rem] font-semibold text-flour">{pick(e, "title", locale)}</span>
                  <span className="block text-sm leading-snug text-flour/60">{pick(e, "place", locale)}</span>
                  {i < timeline.length - 1 && <span aria-hidden className="absolute top-5 end-3 h-px w-6 bg-gold/40" />}
                </li>
              ))}
            </ol>
            {firstYear && lastYear && (
              <p className="sr-only">{`${timeline.length} ${t.home.timelineMore}, ${firstYear}–${lastYear}`}</p>
            )}
          </div>
        )}
      </section>

      {/* 3 — Categories */}
      {leadCat && (
        <section className="container-page py-16 md:py-24">
          <div className="grid gap-6 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="t-kicker">{t.home.productsEyebrow}</p>
              <h2 className="t-h2 mt-2 text-seal">{t.home.productsTitle}</h2>
            </div>
            <p className="text-muted md:col-span-5 md:text-end">{t.home.productsBody}</p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4 lg:grid-rows-2">
            <CategoryTile cat={leadCat} locale={locale} big ph={ph} countLabel={t.home.productCount(leadCat._count.products)} />
            {restCats.map((cat) => (
              <CategoryTile key={cat.id} cat={cat} locale={locale} ph={ph} countLabel={t.home.productCount(cat._count.products)} />
            ))}
          </div>
        </section>
      )}

      {/* 4 — Signature products */}
      {featured.length > 0 && (
        <section className="bg-dough/70 py-16 md:py-24">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="t-kicker">{t.home.signatureEyebrow}</p>
                <h2 className="t-h2 mt-2 text-seal">{t.home.signatureTitle}</h2>
              </div>
              <Link href={`/${locale}/products`} className="link-underline font-semibold text-seal">{t.cta.viewAll}</Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} locale={locale} placeholderLabel={ph} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5 — Retailers */}
      <section className="bg-kashi-deep text-flour">
        <div className="grid md:grid-cols-2">
          <div className="container-page py-16 md:max-w-none md:py-24 md:ps-[max(2.5rem,calc((100vw-82rem)/2+2.5rem))] md:pe-12">
            <p className="text-[0.95rem] font-semibold text-gold-soft">{t.home.retailersEyebrow}</p>
            <h2 className="t-h2 mt-2">{c("home.retailers.title")}</h2>
            <p className="mt-5 max-w-md text-lg text-flour/85">{c("home.retailers.body")}</p>
            {govsWithRetailers.length > 0 && (
              <ul className="mt-8 flex flex-wrap gap-2">
                {govsWithRetailers.map((g) => (
                  <li key={g.slug}>
                    <Link href={`/${locale}/retailers?gov=${g.slug}`} className="inline-flex min-h-10 items-center rounded-full border border-flour/30 px-4 text-[0.95rem] hover:border-gold hover:text-gold-soft">{g[locale]}</Link>
                  </li>
                ))}
              </ul>
            )}
            <Link href={`/${locale}/retailers`} className="btn btn-gold mt-8">{t.cta.findRetailer}</Link>
            {hasDemo && <p className="mt-6 max-w-md text-sm text-flour/70">{t.retailers.demoBanner}</p>}
          </div>
          <div className="min-h-[24rem] bg-seal-deep/30">
            <HomeRetailerMap points={points} locale={locale} label={t.retailers.title} loading={t.retailers.mapLoading} />
          </div>
        </div>
      </section>

      {/* 6 — Quality and craft */}
      <section className="container-page py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4 md:pt-10">
            <p className="t-kicker">{t.home.qualityEyebrow}</p>
            <h2 className="t-h2 mt-2 text-seal">{c("home.quality.title")}</h2>
            <p className="mt-5 text-lg leading-[1.9] text-muted">{c("home.quality.body")}</p>
          </div>
          <div className="grid grid-cols-6 gap-3 md:col-span-8 md:gap-4">
            <Photo src="/brand/gallery/gallery-21.webp" alt={locale === "ar" ? "سلال الخبز والمعجنات داخل مخبز باب الآغا" : "Baskets of bread and pastries inside the Bab Al Agha bakery"} sizes="(min-width: 768px) 40vw, 100vw" className="col-span-6 aspect-[16/10] rounded-[var(--radius-soft)] md:col-span-4 md:row-span-2 md:aspect-auto" placeholderLabel={ph} />
            <Photo src="/brand/gallery/gallery-11.webp" alt={locale === "ar" ? "صواني البقلاوة" : "Trays of baklava"} sizes="(min-width: 768px) 20vw, 50vw" className="col-span-3 aspect-square rounded-[var(--radius-soft)] md:col-span-2" placeholderLabel={ph} />
            <Photo src="/brand/gallery/gallery-13.webp" alt={locale === "ar" ? "حلويات شرقية مرتّبة في صوانيها" : "Oriental sweets arranged in their trays"} sizes="(min-width: 768px) 20vw, 50vw" className="col-span-3 aspect-square rounded-[var(--radius-soft)] md:col-span-2" placeholderLabel={ph} />
          </div>
        </div>
      </section>

      {/* 7 — Social */}
      {gallery.length > 0 && (
        <section className="border-t border-line bg-flour py-16 md:py-20">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="t-kicker" dir="ltr">{t.home.socialEyebrow}</p>
                <h2 className="t-h2 mt-2 text-seal">{t.home.socialTitle}</h2>
              </div>
              <a href={s("social.instagram")} target="_blank" rel="noopener noreferrer" className="btn btn-ghost text-seal">
                <SocialIcon name="instagram" /> {t.cta.followInstagram}
              </a>
            </div>
            <ul className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {gallery.map((g) => (
                <li key={g.id}>
                  <a href={g.link || s("social.instagram")} target="_blank" rel="noopener noreferrer" className="block">
                    <Photo src={g.url} alt={pick(g, "alt", locale) || t.brandFull} sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw" className="aspect-square rounded-[var(--radius-soft)]" placeholderLabel={ph} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 8 — Partners */}
      <section className="relative overflow-hidden bg-seal-deep text-flour">
        <Image src="/brand/facade.webp" alt="" fill sizes="100vw" className="object-cover opacity-40" />
        <div className="relative container-page grid gap-8 py-20 md:grid-cols-12 md:py-28">
          <div className="md:col-span-7">
            <p className="text-[0.95rem] font-semibold text-gold">{t.home.partnersEyebrow}</p>
            <h2 className="t-h2 mt-2">{c("home.partners.title")}</h2>
            <p className="mt-5 max-w-xl text-lg text-flour/90">{c("home.partners.body")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/${locale}/partners`} className="btn btn-gold">{t.cta.becomePartner}</Link>
              <a href={`tel:${s("contact.phone.sales")}`} className="btn btn-ghost">{t.cta.contactSales}</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function CategoryTile({
  cat,
  locale,
  big,
  ph,
  countLabel,
}: {
  cat: { slug: string; nameAr: string; nameEn: string; imageUrl: string | null; descriptionAr: string | null; descriptionEn: string | null };
  locale: Locale;
  big?: boolean;
  ph: string;
  countLabel: string;
}) {
  const name = pick(cat, "name", locale);
  return (
    <Link
      href={`/${locale}/categories/${cat.slug}`}
      className={`group relative block overflow-hidden rounded-[var(--radius-soft)] bg-seal ${big ? "col-span-2 aspect-[16/11] lg:row-span-2 lg:aspect-auto" : "aspect-square sm:aspect-[4/3]"}`}
    >
      <Photo src={cat.imageUrl} alt="" sizes={big ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"} className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.03]" placeholderLabel={ph} />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-seal-deep/90 via-seal-deep/45 to-transparent p-5 pt-16">
        <h3 className={`font-[family-name:var(--font-display)] font-bold text-flour ${big ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"}`}>{name}</h3>
        <p className="mt-1 text-sm text-gold-soft">{countLabel}</p>
      </div>
    </Link>
  );
}
