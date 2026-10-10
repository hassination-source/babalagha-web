import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Amiri, IBM_Plex_Sans_Arabic, Aref_Ruqaa } from "next/font/google";
import "../globals.css";
import { isLocale, dir, siteUrl } from "@/lib/i18n";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { JsonLd } from "@/components/site/bits";
import { organizationJsonLd } from "@/lib/seo";

const amiri = Amiri({ subsets: ["arabic", "latin"], weight: ["400", "700"], variable: "--font-amiri", display: "swap" });
const plex = IBM_Plex_Sans_Arabic({ subsets: ["arabic", "latin"], weight: ["400", "500", "600", "700"], variable: "--font-plex", display: "swap" });
const ruqaa = Aref_Ruqaa({ subsets: ["arabic"], weight: ["400", "700"], variable: "--font-ruqaa", display: "swap", preload: false });

// Public pages read the catalogue, content and retailers from the database on each request, so admin
// edits appear immediately and builds do not require database access. Responses are small and
// server-rendered; put a CDN in front for caching if traffic requires it (see docs/DEPLOYMENT.md).
export const dynamic = "force-dynamic";

export const viewport: Viewport = { themeColor: "#4a1c12", width: "device-width", initialScale: 1 };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const ar = locale === "ar";
  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: ar ? "مخابز باب الآغا | خبز عراقي أصيل منذ 1948" : "Bab Al Agha Bakeries | Authentic Iraqi bread since 1948",
      template: ar ? "%s | مخابز باب الآغا" : "%s | Bab Al Agha Bakeries",
    },
    applicationName: ar ? "باب الآغا" : "Bab Al Agha",
    icons: { icon: "/brand/favicon.png", apple: "/brand/apple-touch-icon.png" },
    formatDetection: { telephone: false },
    // Existing Google Search Console verification from the old babalagha.com site.
    verification: { google: "NSIby5B-PyequwNm09UIPKfBR1QI8RTl6HQGk8X0k74" },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={locale} dir={dir(locale)} className={`${amiri.variable} ${plex.variable} ${ruqaa.variable}`}>
      <body className="min-h-dvh antialiased">
        <JsonLd data={organizationJsonLd(locale)} />
        <Header locale={locale} />
        <main id="main">{children}</main>
        <Footer locale={locale} />
      </body>
    </html>
  );
}
