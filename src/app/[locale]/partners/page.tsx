import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { isLocale, pick } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";
import { getSettings, displayPhone } from "@/lib/content";
import { getCategories } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";
import { formToken } from "@/lib/spam";
import { GOVERNORATES } from "@/lib/iraq";
import { Breadcrumbs } from "@/components/site/bits";
import { PartnerForm } from "@/components/forms/PartnerForm";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return pageMetadata({ locale, path: "/partners", title: t.partners.title, description: t.partners.intro, image: "/brand/facade.webp" });
}

export default async function PartnersPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const [s, categories] = await Promise.all([getSettings(), getCategories()]);
  const sales = s("contact.phone.sales");

  return (
    <>
      <section className="relative overflow-hidden bg-seal-deep text-flour">
        <Image src="/brand/gallery/gallery-03.webp" alt="" fill priority sizes="100vw" className="object-cover opacity-35" />
        <div className="relative container-page py-12 md:py-20">
          <div className="text-flour/70 [&_a:hover]:text-flour [&_span[aria-current]]:text-flour">
            <Breadcrumbs label={locale === "ar" ? "مسار التنقل" : "Breadcrumb"} items={[{ name: t.common.home, href: `/${locale}` }, { name: t.nav.partners }]} />
          </div>
          <p className="mt-10 font-semibold text-gold">{t.partners.eyebrow}</p>
          <h1 className="t-display mt-2 max-w-3xl">{t.partners.title}</h1>
          <p className="mt-5 max-w-2xl text-lg text-flour/90">{t.partners.intro}</p>
          <a href="#partner-form" className="btn btn-gold mt-8">{t.cta.becomePartner}</a>
        </div>
      </section>

      <section className="container-page py-14 md:py-20">
        <h2 className="t-h2 text-seal">{t.partners.whyTitle}</h2>
        <dl className="mt-10 grid gap-10 md:grid-cols-3">
          {t.partners.why.map((w) => (
            <div key={w.t} className="border-t-2 border-gold pt-5">
              <dt className="t-h3 text-seal">{w.t}</dt>
              <dd className="mt-2 text-muted">{w.d}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="partner-form" className="scroll-mt-24 bg-dough/70 py-14 md:py-20">
        <div className="container-page grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <h2 className="t-h2 text-seal">{t.partners.formTitle}</h2>
            <p className="mt-3 text-muted">{t.partners.formIntro}</p>
            {sales && (
              <div className="mt-8 border-t border-line pt-6">
                <h3 className="font-semibold">{t.partners.salesTitle}</h3>
                <a href={`tel:${sales}`} dir="ltr" className="mt-1 inline-block font-[family-name:var(--font-display)] text-2xl text-seal hover:underline">{displayPhone(sales)}</a>
                <p className="mt-1"><a href={`mailto:${s("contact.email")}`} dir="ltr" className="link-underline">{s("contact.email")}</a></p>
              </div>
            )}
          </div>
          <div className="rounded-[var(--radius-soft)] border border-line bg-white p-5 md:col-span-8 md:p-8">
            <PartnerForm
              dict={t.form}
              token={formToken()}
              locale={locale}
              successMessage={t.partners.success}
              governorates={GOVERNORATES.map((g) => ({ value: g.slug, label: g[locale] }))}
              categories={categories.map((c) => ({ value: c.slug, label: pick(c, "name", locale) }))}
            />
          </div>
        </div>
      </section>
    </>
  );
}
