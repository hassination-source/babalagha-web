import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import type { ProductCardData } from "@/lib/catalog";

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

/** Image with a clearly labelled placeholder when no approved photo exists. */
export function Photo({
  src,
  alt,
  sizes,
  className = "",
  priority,
  placeholderLabel,
}: {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  placeholderLabel: string;
}) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-dough text-center text-sm text-muted ${className}`} role="img" aria-label={placeholderLabel}>
        <span className="rounded border border-dashed border-muted/40 px-3 py-2">{placeholderLabel}</span>
      </div>
    );
  }
  return (
    <div className={`${/\babsolute\b/.test(className) ? "" : "relative "}overflow-hidden bg-white ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  );
}

export function ProductCard({ product, locale, placeholderLabel, showCategory = true }: { product: ProductCardData; locale: Locale; placeholderLabel: string; showCategory?: boolean }) {
  const name = pick(product, "name", locale);
  const other = locale === "ar" ? product.nameEn : product.nameAr;
  const img = product.images[0];
  return (
    <article className="group relative">
      <Photo
        src={img?.url}
        alt={pick(img ?? {}, "alt", locale) || name}
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        className="aspect-[4/5] rounded-[var(--radius-soft)]"
        placeholderLabel={placeholderLabel}
      />
      <div className="mt-3">
        {showCategory && <p className="text-sm text-kashi-deep">{pick(product.category, "name", locale)}</p>}
        <h3 className="mt-0.5 font-[family-name:var(--font-display)] text-xl leading-snug text-ink">
          <Link href={`/${locale}/products/${product.slug}`} className="after:absolute after:inset-0 group-hover:text-seal">
            {name}
          </Link>
        </h3>
        {other && <p className="text-sm text-muted" lang={locale === "ar" ? "en" : "ar"}>{other}</p>}
      </div>
    </article>
  );
}

export function Breadcrumbs({ items, label }: { items: { name: string; href?: string }[]; label: string }) {
  return (
    <nav aria-label={label} className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden className="text-line">/</span>}
            {it.href ? (
              <Link href={it.href} className="hover:text-seal hover:underline">{it.name}</Link>
            ) : (
              <span aria-current="page" className="text-ink">{it.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHero({ kicker, title, intro, children }: { kicker?: string; title: string; intro?: string; children?: React.ReactNode }) {
  return (
    <section className="border-b border-line bg-dough/60">
      <div className="container-page py-12 md:py-16">
        {children}
        {kicker && <p className="t-kicker mt-6">{kicker}</p>}
        <h1 className="t-display mt-2 max-w-4xl text-seal">{title}</h1>
        {intro && <p className="t-lead mt-4">{intro}</p>}
      </div>
    </section>
  );
}
