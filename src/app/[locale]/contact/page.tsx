import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, pick } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";
import { getSettings, displayPhone, whatsappLink } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { formToken } from "@/lib/spam";
import { INQUIRY_KINDS } from "@/lib/validation";
import { getProduct } from "@/lib/catalog";
import { Breadcrumbs, PageHero } from "@/components/site/bits";
import { ContactForm } from "@/components/forms/ContactForm";
import { SocialIcon } from "@/components/site/SocialIcon";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return pageMetadata({ locale, path: "/contact", title: t.contact.title, description: t.contact.intro });
}

export default async function ContactPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const sp = await searchParams;
  const t = getDictionary(locale);
  const s = await getSettings();
  const kindParam = typeof sp.kind === "string" && (INQUIRY_KINDS as readonly string[]).includes(sp.kind) ? sp.kind : undefined;
  const productSlug = typeof sp.product === "string" ? sp.product.slice(0, 80) : undefined;
  const product = productSlug ? await getProduct(productSlug) : null;

  const phones = [
    { label: locale === "ar" ? "خدمة الزبائن" : "Customer service", v: s("contact.phone.customer") },
    { label: locale === "ar" ? "المبيعات" : "Sales", v: s("contact.phone.sales") },
    { label: locale === "ar" ? "الإدارة" : "Management", v: s("contact.phone.management") },
  ].filter((p) => p.v);
  const whatsapp = s("contact.whatsapp");
  const hours = s(locale === "ar" ? "contact.hours.ar" : "contact.hours.en");

  return (
    <>
      <PageHero title={t.contact.title} intro={t.contact.intro}>
        <Breadcrumbs label={locale === "ar" ? "مسار التنقل" : "Breadcrumb"} items={[{ name: t.common.home, href: `/${locale}` }, { name: t.contact.title }]} />
      </PageHero>
      <div className="container-page grid gap-12 py-12 md:grid-cols-12 md:py-16">
        <aside className="space-y-10 md:col-span-5 lg:col-span-4">
          <section>
            <h2 className="text-base font-semibold text-kashi-deep">{t.contact.phones}</h2>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {phones.map((p) => (
                <li key={p.v} className="flex items-center justify-between gap-3 py-3">
                  <span>{p.label}</span>
                  <a href={`tel:${p.v}`} dir="ltr" className="inline-flex min-h-11 items-center gap-2 font-semibold text-seal hover:underline">
                    <SocialIcon name="phone" size={18} /> {displayPhone(p.v)}
                  </a>
                </li>
              ))}
            </ul>
            {whatsapp && (
              <a href={whatsappLink(whatsapp)} target="_blank" rel="noopener noreferrer" className="btn btn-kashi mt-5">
                <SocialIcon name="whatsapp" /> {t.cta.whatsapp}
              </a>
            )}
          </section>
          <section>
            <h2 className="text-base font-semibold text-kashi-deep">{t.contact.email}</h2>
            <a href={`mailto:${s("contact.email")}`} dir="ltr" className="link-underline mt-2 inline-block text-lg">{s("contact.email")}</a>
          </section>
          <section>
            <h2 className="text-base font-semibold text-kashi-deep">{t.contact.address}</h2>
            <p className="mt-2 leading-relaxed">{s(locale === "ar" ? "contact.address.ar" : "contact.address.en")}</p>
            {hours && <p className="mt-2 text-muted">{hours}</p>}
          </section>
          <section>
            <h2 className="text-base font-semibold text-kashi-deep">{t.contact.social}</h2>
            <div className="mt-3 flex gap-2">
              <a href={s("social.instagram")} target="_blank" rel="noopener noreferrer" className="btn btn-ghost text-seal"><SocialIcon name="instagram" /> Instagram</a>
              <a href={s("social.facebook")} target="_blank" rel="noopener noreferrer" className="btn btn-ghost text-seal"><SocialIcon name="facebook" /> Facebook</a>
            </div>
          </section>
        </aside>
        <section className="md:col-span-7 lg:col-span-7 lg:col-start-6" aria-labelledby="contact-form-title">
          <div className="rounded-[var(--radius-soft)] border border-line bg-white p-5 md:p-8">
            <h2 id="contact-form-title" className="t-h3 text-seal">{t.contact.formTitle}</h2>
            <div className="mt-6">
              <ContactForm
                dict={t.form}
                kinds={t.contact.kinds}
                token={formToken()}
                locale={locale}
                successMessage={t.contact.success}
                defaultKind={kindParam}
                defaultSubject={product ? pick(product, "name", locale) : undefined}
              />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
