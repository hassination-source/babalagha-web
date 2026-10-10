import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";
import { getCategories } from "@/lib/catalog";
import { getContent, getSettings, displayPhone } from "@/lib/content";
import { LanguageSwitch } from "./LanguageSwitch";
import { SocialIcon } from "./SocialIcon";

export async function Footer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const [categories, c, s] = await Promise.all([
    getCategories().catch(() => []),
    getContent(locale),
    getSettings(),
  ]);
  const phones = [
    { label: locale === "ar" ? "خدمة الزبائن" : "Customer service", v: s("contact.phone.customer") },
    { label: locale === "ar" ? "المبيعات" : "Sales", v: s("contact.phone.sales") },
    { label: locale === "ar" ? "الإدارة" : "Management", v: s("contact.phone.management") },
  ].filter((p) => p.v);

  return (
    <footer className="bg-seal-deep text-flour/85">
      <div className="kashi-band kashi-band-thin" aria-hidden />
      <div className="container-page grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="flex items-center gap-4">
            <Image src="/brand/logo-seal.png" alt={t.brandFull} width={72} height={72} className="size-16" />
            <div>
              <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-flour">{t.brandFull}</p>
              <p className="text-sm text-gold">{t.since}</p>
            </div>
          </div>
          <p className="mt-6 max-w-sm leading-relaxed">{c("footer.description")}</p>
          <p className="mt-5 font-[family-name:var(--font-ruqaa)] text-xl leading-relaxed text-gold" lang="ar">
            {c("brand.slogan")}
          </p>
        </div>

        <nav className="md:col-span-2" aria-label={t.footer.explore}>
          <h2 className="font-[family-name:var(--font-sans)] text-base font-semibold text-gold">{t.nav.products}</h2>
          <ul className="mt-4 space-y-2.5">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link className="hover:text-flour hover:underline" href={`/${locale}/categories/${cat.slug}`}>
                  {pick(cat, "name", locale)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="md:col-span-2" aria-label={t.footer.company}>
          <h2 className="font-[family-name:var(--font-sans)] text-base font-semibold text-gold">{t.footer.company}</h2>
          <ul className="mt-4 space-y-2.5">
            <li><Link className="hover:text-flour hover:underline" href={`/${locale}/about`}>{t.nav.about}</Link></li>
            <li><Link className="hover:text-flour hover:underline" href={`/${locale}/retailers`}>{t.nav.retailers}</Link></li>
            <li><Link className="hover:text-flour hover:underline" href={`/${locale}/partners`}>{t.nav.partners}</Link></li>
            <li><Link className="hover:text-flour hover:underline" href={`/${locale}/contact`}>{t.nav.contact}</Link></li>
            <li><Link className="hover:text-flour hover:underline" href={`/${locale}/privacy`}>{t.privacy.title}</Link></li>
          </ul>
        </nav>

        <div className="md:col-span-4">
          <h2 className="font-[family-name:var(--font-sans)] text-base font-semibold text-gold">{t.footer.contact}</h2>
          <ul className="mt-4 space-y-2.5">
            {phones.map((p) => (
              <li key={p.v} className="flex flex-wrap justify-between gap-x-4 border-b border-flour/10 pb-2.5">
                <span>{p.label}</span>
                <a href={`tel:${p.v}`} dir="ltr" className="font-semibold text-flour hover:underline">{displayPhone(p.v)}</a>
              </li>
            ))}
            <li className="pt-1">
              <a href={`mailto:${s("contact.email")}`} dir="ltr" className="text-flour hover:underline">{s("contact.email")}</a>
            </li>
            <li className="text-sm leading-relaxed text-flour/70">{s(locale === "ar" ? "contact.address.ar" : "contact.address.en")}</li>
          </ul>
          <div className="mt-6 flex items-center gap-2">
            <a href={s("social.instagram")} target="_blank" rel="noopener noreferrer" className="inline-flex size-11 items-center justify-center rounded-full border border-flour/20 hover:border-gold hover:text-gold" aria-label="Instagram">
              <SocialIcon name="instagram" />
            </a>
            <a href={s("social.facebook")} target="_blank" rel="noopener noreferrer" className="inline-flex size-11 items-center justify-center rounded-full border border-flour/20 hover:border-gold hover:text-gold" aria-label="Facebook">
              <SocialIcon name="facebook" />
            </a>
            <LanguageSwitch locale={locale} label={t.lang.label} text={t.lang.switchTo} className="ms-auto border border-flour/20 text-flour hover:border-gold" />
          </div>
        </div>
      </div>
      <div className="border-t border-flour/10">
        <div className="container-page flex flex-col gap-2 py-6 text-sm text-flour/60 md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} {t.brandFull}. {t.footer.rights}.</p>
          <p>{locale === "ar" ? "بغداد، العراق" : "Baghdad, Iraq"}</p>
        </div>
      </div>
    </footer>
  );
}
