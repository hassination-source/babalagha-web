import Link from "next/link";
import { headers } from "next/headers";

export default async function NotFound() {
  const h = await headers();
  const path = h.get("x-pathname") ?? "";
  const en = path.startsWith("/en");
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-start justify-center py-20">
      <p className="font-[family-name:var(--font-display)] text-7xl text-gold">404</p>
      <h1 className="t-h2 mt-4 text-seal">{en ? "Page not found" : "الصفحة غير موجودة"}</h1>
      <p className="mt-3 text-muted">{en ? "This page may have moved or is no longer available." : "ربما نُقلت هذه الصفحة أو لم تعد متوفرة."}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={en ? "/en" : "/ar"} className="btn btn-primary">{en ? "Back to home" : "العودة إلى الرئيسية"}</Link>
        <Link href={en ? "/en/products" : "/ar/products"} className="btn btn-ghost text-seal">{en ? "Browse products" : "تصفّح المنتجات"}</Link>
      </div>
    </div>
  );
}
