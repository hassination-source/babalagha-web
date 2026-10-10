"use client";

import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export function LanguageSwitch({ locale, label, text, className = "" }: { locale: Locale; label: string; text: string; className?: string }) {
  const pathname = usePathname() ?? `/${locale}`;
  const target: Locale = locale === "ar" ? "en" : "ar";
  const href = pathname.replace(/^\/(ar|en)(?=\/|$)/, `/${target}`);
  return (
    <a
      href={href}
      hrefLang={target}
      lang={target}
      aria-label={label}
      onClick={() => {
        document.cookie = `NEXT_LOCALE=${target}; path=/; max-age=31536000; samesite=lax`;
      }}
      className={`inline-flex min-h-11 items-center rounded-full px-3 text-[0.95rem] font-semibold ${target === "ar" ? "font-[family-name:var(--font-plex)]" : ""} ${className}`}
    >
      {text}
    </a>
  );
}
