import type { Metadata } from "next";
import { Amiri, IBM_Plex_Sans_Arabic } from "next/font/google";
import "../globals.css";

const amiri = Amiri({ subsets: ["arabic", "latin"], weight: ["700"], variable: "--font-amiri", display: "swap" });
const plex = IBM_Plex_Sans_Arabic({ subsets: ["arabic", "latin"], weight: ["400", "500", "600", "700"], variable: "--font-plex", display: "swap" });

export const metadata: Metadata = {
  title: { default: "لوحة التحكم | باب الآغا", template: "%s | لوحة التحكم" },
  robots: { index: false, follow: false },
  icons: { icon: "/brand/favicon.png" },
};
export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${amiri.variable} ${plex.variable}`}>
      <body className="min-h-dvh bg-[#f6f2ea] text-[0.95rem] antialiased">{children}</body>
    </html>
  );
}
