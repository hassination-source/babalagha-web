"use client";

import { useEffect, useMemo, useState } from "react";
import type { PublicRetailer } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n";
import { GOVERNORATES, directionsUrl } from "@/lib/iraq";
import { normalizeSearch } from "@/lib/search-normalize";
import { RetailerMap } from "./RetailerMap";
import { LazyMount } from "./LazyMount";

type Strings = {
  searchLabel: string; searchPlaceholder: string; governorate: string; allGovernorates: string;
  empty: string; emptyHint: string; back: string; hours: string; phone: string; address: string; type: string;
  verified: string; demo: string; mapLoading: string; showMap: string; showList: string; directions: string; call: string;
  types: Record<string, string>; resultsOne: string; resultsMany: string; resultsNone: string; mapLabel: string;
};

export function RetailerLocator({
  retailers,
  locale,
  s,
  initialGovernorate = "",
  customerPhone,
}: {
  retailers: PublicRetailer[];
  locale: Locale;
  s: Strings;
  initialGovernorate?: string;
  customerPhone: string;
}) {
  const [q, setQ] = useState("");
  const [gov, setGov] = useState(initialGovernorate);
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "map">("list");

  // Read initial filters from the URL (keeps the page statically renderable).
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("q")) setQ(sp.get("q")!);
    if (sp.get("gov") && !initialGovernorate) setGov(sp.get("gov")!);
    const id = sp.get("id");
    if (id && retailers.some((r) => r.id === id)) setSelected(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialGovernorate]);

  useEffect(() => {
    if (initialGovernorate) return;
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (gov) sp.set("gov", gov);
    const qs = sp.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [q, gov, initialGovernorate]);

  const L = (r: PublicRetailer, base: "name" | "city" | "district" | "address" | "notes") => {
    const en = r[`${base}En` as keyof PublicRetailer] as string | null;
    const ar = r[`${base}Ar` as keyof PublicRetailer] as string | null;
    return locale === "en" ? en || ar : ar || en;
  };

  const filtered = useMemo(() => {
    const term = normalizeSearch(q);
    return retailers.filter((r) => {
      if (gov && r.governorate !== gov) return false;
      if (!term) return true;
      const g = GOVERNORATES.find((x) => x.slug === r.governorate);
      const hay = normalizeSearch(
        [r.nameAr, r.nameEn, r.cityAr, r.cityEn, r.districtAr, r.districtEn, r.addressAr, r.addressEn, g?.ar, g?.en].filter(Boolean).join(" "),
      );
      return hay.includes(term);
    });
  }, [retailers, q, gov]);

  const points = useMemo(
    () =>
      filtered
        .filter((r) => r.latitude !== null && r.longitude !== null)
        .map((r) => ({ id: r.id, lat: r.latitude!, lng: r.longitude!, label: L(r, "name") ?? "", demo: r.isDemo })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtered, locale],
  );

  const current = filtered.find((r) => r.id === selected) ?? null;
  const count = filtered.length;
  const countText = count === 0 ? s.resultsNone : count === 1 ? s.resultsOne : s.resultsMany.replace("{n}", String(count));
  const govName = (slug: string) => GOVERNORATES.find((g) => g.slug === slug)?.[locale] ?? slug;

  const select = (id: string) => {
    setSelected(id);
    setView((v) => v); // keep current mobile view
    requestAnimationFrame(() => document.getElementById("retailer-detail")?.focus());
  };

  return (
    <div className="grid gap-0 overflow-hidden rounded-[var(--radius-soft)] border border-line bg-white lg:grid-cols-[minmax(22rem,26rem)_1fr]">
      {/* Panel */}
      <div className={`flex min-h-0 flex-col border-line lg:border-e ${view === "map" ? "hidden lg:flex" : "flex"}`}>
        <form role="search" onSubmit={(e) => e.preventDefault()} className="space-y-3 border-b border-line bg-flour p-4">
          <div>
            <label htmlFor="loc-q" className="field-label">{s.searchLabel}</label>
            <input id="loc-q" type="search" value={q} onChange={(e) => { setQ(e.target.value); setSelected(null); }} placeholder={s.searchPlaceholder} className="field" autoComplete="off" />
          </div>
          {!initialGovernorate && (
            <div>
              <label htmlFor="loc-gov" className="field-label">{s.governorate}</label>
              <select id="loc-gov" value={gov} onChange={(e) => { setGov(e.target.value); setSelected(null); }} className="field">
                <option value="">{s.allGovernorates}</option>
                {GOVERNORATES.map((g) => (
                  <option key={g.slug} value={g.slug}>{g[locale]}</option>
                ))}
              </select>
            </div>
          )}
          <p className="text-sm text-muted" aria-live="polite">{countText}</p>
        </form>

        {current ? (
          <section id="retailer-detail" tabIndex={-1} aria-labelledby="retailer-detail-name" className="flex-1 overflow-y-auto p-5 outline-none">
            <button type="button" onClick={() => setSelected(null)} className="mb-4 inline-flex min-h-11 items-center gap-2 font-semibold text-kashi-deep hover:underline">
              <span aria-hidden className="rtl:rotate-180">‹</span> {s.back}
            </button>
            <div className="flex flex-wrap gap-2">
              {current.isDemo && <span className="rounded-full bg-muted/15 px-2.5 py-0.5 text-xs font-semibold text-muted">{s.demo}</span>}
              {current.verified && !current.isDemo && <span className="rounded-full bg-kashi/12 px-2.5 py-0.5 text-xs font-semibold text-kashi-deep">{s.verified}</span>}
            </div>
            <h2 id="retailer-detail-name" className="t-h3 mt-2 text-seal">{L(current, "name")}</h2>
            <dl className="mt-4 space-y-3 text-[0.97rem]">
              <div><dt className="text-sm text-muted">{s.type}</dt><dd>{s.types[current.type]}</dd></div>
              <div>
                <dt className="text-sm text-muted">{s.address}</dt>
                <dd>{[L(current, "address"), L(current, "district"), L(current, "city"), govName(current.governorate)].filter(Boolean).join("، ")}</dd>
              </div>
              {current.phone && (
                <div><dt className="text-sm text-muted">{s.phone}</dt><dd><a dir="ltr" className="link-underline" href={`tel:${current.phone}`}>{current.phone}</a></dd></div>
              )}
              {current.openingHours && (
                <div><dt className="text-sm text-muted">{s.hours}</dt><dd>{current.openingHours}</dd></div>
              )}
              {L(current, "notes") && <div><dd className="text-muted">{L(current, "notes")}</dd></div>}
            </dl>
            <div className="mt-6 flex flex-wrap gap-2">
              {current.latitude !== null && current.longitude !== null && (
                <a className="btn btn-primary" href={directionsUrl(current.latitude, current.longitude)} target="_blank" rel="noopener noreferrer">{s.directions}</a>
              )}
              {current.phone && <a className="btn btn-ghost text-seal" href={`tel:${current.phone}`}>{s.call}</a>}
              <button type="button" className="btn btn-ghost text-seal lg:hidden" onClick={() => setView("map")}>{s.showMap}</button>
            </div>
          </section>
        ) : count === 0 ? (
          <div className="flex-1 p-6 text-center">
            <p className="font-semibold text-ink">{s.empty}</p>
            <p className="mt-1 text-muted">{s.emptyHint}</p>
            <a href={`tel:${customerPhone}`} dir="ltr" className="btn btn-ghost mt-5 text-seal">{customerPhone.replace(/^\+964/, "0")}</a>
          </div>
        ) : (
          <ul className="max-h-[34rem] flex-1 divide-y divide-line overflow-y-auto lg:max-h-[38rem]">
            {filtered.map((r) => (
              <li key={r.id}>
                <button type="button" onClick={() => select(r.id)} className="block w-full px-5 py-4 text-start hover:bg-flour focus-visible:bg-flour">
                  <span className="flex items-start justify-between gap-3">
                    <span className="font-semibold text-ink">{L(r, "name")}</span>
                    {r.isDemo && <span className="shrink-0 rounded-full bg-muted/15 px-2 py-0.5 text-xs text-muted">{s.demo}</span>}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted">
                    {[L(r, "district"), L(r, "city"), govName(r.governorate)].filter(Boolean).join("، ")} · {s.types[r.type]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map */}
      <div className={`relative ${view === "list" ? "hidden lg:block" : "block"}`}>
        <LazyMount fallback={<div className="flex h-[30rem] items-center justify-center bg-dough text-muted lg:h-full lg:min-h-[38rem]">{s.mapLoading}</div>}>
          <RetailerMap points={points} selectedId={selected} onSelect={select} ariaLabel={s.mapLabel} className="h-[30rem] w-full lg:h-full lg:min-h-[44rem]" />
        </LazyMount>
      </div>

      {/* Mobile view toggle */}
      <div className="sticky bottom-0 z-10 flex justify-center border-t border-line bg-white p-3 lg:hidden">
        <div className="inline-flex rounded-full bg-dough p-1" role="group">
          <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")} className={`min-h-11 rounded-full px-5 font-semibold ${view === "list" ? "bg-seal text-flour" : "text-seal"}`}>{s.showList}</button>
          <button type="button" aria-pressed={view === "map"} onClick={() => setView("map")} className={`min-h-11 rounded-full px-5 font-semibold ${view === "map" ? "bg-seal text-flour" : "text-seal"}`}>{s.showMap}</button>
        </div>
      </div>
    </div>
  );
}
