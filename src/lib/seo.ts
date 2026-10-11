import type { Metadata } from "next";
import { siteUrl, type Locale } from "./i18n";
import { officialContact } from "@/data/official-catalog";

const SITE_NAME = { ar: "مخابز باب الآغا", en: "Bab Al Agha Bakeries" };

export function pageMetadata(opts: {
  locale: Locale;
  path: string; // path after the locale, starting with "/" or ""
  title: string;
  description: string;
  image?: string;
  noindex?: boolean;
}): Metadata {
  const base = siteUrl();
  const p = opts.path === "/" ? "" : opts.path;
  const url = `${base}/${opts.locale}${p}`;
  const image = opts.image ?? "/brand/og-default.jpg";
  return {
    title: opts.title,
    description: opts.description,
    alternates: {
      canonical: url,
      languages: { ar: `${base}/ar${p}`, en: `${base}/en${p}`, "x-default": `${base}/ar${p}` },
    },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME[opts.locale],
      title: opts.title,
      description: opts.description,
      locale: opts.locale === "ar" ? "ar_IQ" : "en_US",
      alternateLocale: opts.locale === "ar" ? ["en_US"] : ["ar_IQ"],
      images: [{ url: image }],
    },
    twitter: { card: "summary_large_image", title: opts.title, description: opts.description, images: [image] },
    robots: process.env.NOINDEX === "true" ? { index: false, follow: false } : opts.noindex ? { index: false, follow: true } : undefined,
  };
}

/** Organization data uses only verified details from the official website. */
export function organizationJsonLd(locale: Locale) {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Bakery",
    "@id": `${base}/#organization`,
    name: locale === "ar" ? "شركة مخابز باب الآغا" : "Bab Al Agha Bakeries",
    alternateName: ["Bab Alagha Bakery", "باب الآغا"],
    url: `${base}/${locale}`,
    logo: `${base}/brand/logo-seal.png`,
    image: `${base}/brand/facade.webp`,
    foundingDate: "1948",
    foundingLocation: { "@type": "Place", name: "Baghdad, Iraq" },
    email: officialContact.email,
    telephone: officialContact.phones[2]!.number,
    address: {
      "@type": "PostalAddress",
      streetAddress: locale === "ar" ? "منطقة عويريج الصناعية، طريق بغداد – الحلة" : "Awerij Industrial Area, Baghdad–Hilla Road",
      addressLocality: locale === "ar" ? "بغداد" : "Baghdad",
      addressCountry: "IQ",
    },
    contactPoint: officialContact.phones.map((p) => ({
      "@type": "ContactPoint",
      telephone: p.number,
      contactType: p.key === "sales" ? "sales" : p.key === "customer" ? "customer service" : "customer support",
      areaServed: "IQ",
      availableLanguage: ["Arabic"],
    })),
    sameAs: [officialContact.facebook, officialContact.instagram],
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: it.url })),
  };
}

/** Product structured data without offers, ratings or availability (none are published). */
export function productJsonLd(p: { name: string; description?: string | null; image: string[]; url: string; category: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description ?? undefined,
    image: p.image,
    url: p.url,
    category: p.category,
    brand: { "@type": "Brand", name: "Bab Al Agha" },
    manufacturer: { "@id": `${siteUrl()}/#organization` },
  };
}
