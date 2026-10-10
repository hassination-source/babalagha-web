import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";
import { getCategories, searchProducts } from "@/lib/catalog";
import { ProductCard } from "./bits";

/** Shared listing used by /products and /categories/[slug]. Works without JavaScript (plain GET form). */
export async function Catalog({
  locale,
  q,
  category,
  page,
  basePath,
}: {
  locale: Locale;
  q?: string;
  category?: string;
  page: number;
  basePath: string;
}) {
  const t = getDictionary(locale);
  const [categories, result] = await Promise.all([getCategories(), searchProducts({ q, category, page })]);
  const qs = (p: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (p > 1) sp.set("page", String(p));
    const s = sp.toString();
    return s ? `${basePath}?${s}` : basePath;
  };

  return (
    <div className="container-page py-10 md:py-14">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <nav aria-label={t.products.category} className="-mx-1 overflow-x-auto pb-1">
          <ul className="flex gap-2 px-1">
            <li>
              <Link
                href={`/${locale}/products${q ? `?q=${encodeURIComponent(q)}` : ""}`}
                aria-current={!category ? "page" : undefined}
                className={`inline-flex min-h-11 items-center whitespace-nowrap rounded-full border px-4 text-[0.95rem] font-medium ${!category ? "border-seal bg-seal text-flour" : "border-line bg-white text-ink hover:border-seal"}`}
              >
                {t.products.all}
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/${locale}/categories/${c.slug}${q ? `?q=${encodeURIComponent(q)}` : ""}`}
                  aria-current={category === c.slug ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center whitespace-nowrap rounded-full border px-4 text-[0.95rem] font-medium ${category === c.slug ? "border-seal bg-seal text-flour" : "border-line bg-white text-ink hover:border-seal"}`}
                >
                  {pick(c, "name", locale)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <form role="search" action={basePath} method="get" className="flex w-full gap-2 lg:w-[24rem]">
          <label htmlFor="product-q" className="sr-only">{t.products.search}</label>
          <input id="product-q" name="q" type="search" defaultValue={q} placeholder={t.products.searchPlaceholder} className="field" />
          <button type="submit" className="btn btn-primary shrink-0">{t.products.searchSubmit}</button>
        </form>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-muted" aria-live="polite">
        <span>{t.products.results(result.total)}</span>
        {q && <Link href={basePath} className="link-underline text-seal">{t.products.clear}</Link>}
      </div>

      {result.items.length === 0 ? (
        <div className="mt-10 rounded-[var(--radius-soft)] border border-dashed border-line bg-white px-6 py-16 text-center">
          <p className="t-h3 text-seal">{t.products.empty}</p>
          <p className="mt-2 text-muted">{t.products.emptyHint}</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {result.items.map((p) => (
            <ProductCard key={p.id} product={p} locale={locale} placeholderLabel={t.common.placeholder} showCategory={!category} />
          ))}
        </div>
      )}

      {result.pages > 1 && (
        <nav aria-label={t.products.page(result.page, result.pages)} className="mt-14 flex items-center justify-center gap-3">
          {result.page > 1 ? <Link rel="prev" href={qs(result.page - 1)} className="btn btn-ghost text-seal">{t.products.prev}</Link> : <span />}
          <span className="text-sm text-muted">{t.products.page(result.page, result.pages)}</span>
          {result.page < result.pages ? <Link rel="next" href={qs(result.page + 1)} className="btn btn-ghost text-seal">{t.products.next}</Link> : <span />}
        </nav>
      )}
    </div>
  );
}

export function parsePage(v: string | string[] | undefined): number {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isInteger(n) && n > 0 && n < 10000 ? n : 1;
}

export function parseQ(v: string | string[] | undefined): string | undefined {
  const s = (Array.isArray(v) ? v[0] : v)?.trim();
  return s ? s.slice(0, 80) : undefined;
}
