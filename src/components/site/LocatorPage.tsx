import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";
import { getSettings } from "@/lib/content";
import { getPublicRetailers } from "@/lib/catalog";
import { formToken } from "@/lib/spam";
import { GOVERNORATES } from "@/lib/iraq";
import { RetailerLocator } from "@/components/map/RetailerLocator";
import { RetailerSubmitForm } from "@/components/forms/RetailerSubmitForm";

/** Shared by /retailers and the indexable /retailers/[governorate] pages. */
export async function LocatorPage({ locale, governorate }: { locale: Locale; governorate?: string }) {
  const t = getDictionary(locale);
  const s = await getSettings();
  const retailers = await getPublicRetailers({ showDemo: s("locator.showDemo") === "true", governorate });
  const hasDemo = retailers.some((r) => r.isDemo);
  const r = t.retailers;

  return (
    <>
      <div className="container-page py-8 md:py-10">
        {hasDemo && (
          <p role="note" className="mb-5 rounded-[var(--radius-soft)] border border-dashed border-crust/50 bg-crust/[0.07] px-4 py-3 text-[0.95rem] text-ink">
            {r.demoBanner}
          </p>
        )}
        {retailers.length === 0 && !governorate ? (
          <div className="rounded-[var(--radius-soft)] border border-line bg-white px-6 py-14 text-center">
            <p className="t-h3 text-seal">{r.noRetailersYet}</p>
            <a href={`tel:${s("contact.phone.customer")}`} dir="ltr" className="btn btn-primary mt-6">{s("contact.phone.customer").replace(/^\+964/, "0")}</a>
          </div>
        ) : (
          <RetailerLocator
            retailers={retailers}
            locale={locale}
            initialGovernorate={governorate}
            customerPhone={s("contact.phone.customer")}
            s={{
              searchLabel: r.searchLabel, searchPlaceholder: r.searchPlaceholder, governorate: r.governorate, allGovernorates: r.allGovernorates,
              empty: r.empty, emptyHint: r.emptyHint, back: r.back, hours: r.hours, phone: r.phone, address: r.address, type: r.type,
              verified: r.verified, demo: r.demo, mapLoading: r.mapLoading, showMap: r.showMap, showList: r.showList,
              directions: t.cta.directions, call: t.cta.call, types: r.types,
              resultsNone: r.results(0), resultsOne: r.results(1), resultsMany: locale === "ar" ? "{n} منافذ" : "{n} outlets",
              mapLabel: locale === "ar" ? "خريطة منافذ بيع باب الآغا في العراق" : "Map of Bab Al Agha retailers in Iraq",
            }}
          />
        )}
      </div>

      <section id="add-store" className="scroll-mt-24 border-t border-line bg-dough/70 py-14 md:py-20">
        <div className="container-page grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <h2 className="t-h2 text-seal">{r.submitTitle}</h2>
            <p className="mt-3 text-muted">{r.submitBody}</p>
          </div>
          <div className="rounded-[var(--radius-soft)] border border-line bg-white p-5 md:col-span-8 md:p-8">
            <RetailerSubmitForm dict={t.form} token={formToken()} locale={locale} governorates={GOVERNORATES.map((g) => ({ value: g.slug, label: g[locale] }))} />
          </div>
        </div>
      </section>
    </>
  );
}
