import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";
import { LanguageSwitch } from "./LanguageSwitch";
import { MobileNav } from "./MobileNav";

export function navItems(locale: Locale) {
  const t = getDictionary(locale).nav;
  return [
    { href: `/${locale}/products`, label: t.products },
    { href: `/${locale}/about`, label: t.about },
    { href: `/${locale}/retailers`, label: t.retailers },
    { href: `/${locale}/partners`, label: t.partners },
    { href: `/${locale}/contact`, label: t.contact },
  ];
}

export function Header({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const items = navItems(locale);
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-flour/92 backdrop-blur supports-[backdrop-filter]:bg-flour/80">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-3 focus:z-50 focus:rounded focus:bg-seal focus:px-4 focus:py-2 focus:text-flour">
        {t.nav.skip}
      </a>
      <div className="container-page flex h-[4.5rem] items-center justify-between gap-4">
        <Link href={`/${locale}`} className="flex items-center gap-3" aria-label={t.brandFull}>
          <Image src="/brand/logo-seal.png" alt="" width={48} height={48} priority className="size-11 md:size-12" />
          <span className="leading-tight">
            <span className="block font-[family-name:var(--font-display)] text-xl font-bold text-seal md:text-[1.4rem]">{t.brand}</span>
            <span className="block text-xs text-muted">{t.since}</span>
          </span>
        </Link>

        <nav aria-label={locale === "ar" ? "الرئيسية" : "Main"} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {items.map((it) => (
              <li key={it.href}>
                <Link href={it.href} className="rounded-full px-3.5 py-2 text-[0.98rem] font-medium text-ink/85 transition-colors hover:bg-dough hover:text-seal">
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <LanguageSwitch locale={locale} label={t.lang.label} text={t.lang.switchTo} className="text-seal hover:bg-dough" />
          <Link href={`/${locale}/retailers`} className="btn btn-primary hidden !min-h-11 !px-5 text-[0.95rem] md:inline-flex lg:hidden xl:inline-flex">
            {t.nav.retailers}
          </Link>
          <MobileNav items={items} menuLabel={t.nav.menu} closeLabel={t.nav.close} />
        </div>
      </div>
    </header>
  );
}
