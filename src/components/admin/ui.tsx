import Link from "next/link";

export function PageHeader({ title, children, back }: { title: string; children?: React.ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-6">
      {back && (
        <Link href={back.href} className="text-sm text-kashi-deep hover:underline">‹ {back.label}</Link>
      )}
      <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-seal">{title}</h1>
        {children && <div className="flex flex-wrap gap-2">{children}</div>}
      </div>
    </div>
  );
}

export function Card({ children, title, className = "" }: { children: React.ReactNode; title?: string; className?: string }) {
  return (
    <section className={`rounded-lg border border-line bg-white p-5 ${className}`}>
      {title && <h2 className="mb-4 text-base font-bold text-seal">{title}</h2>}
      {children}
    </section>
  );
}

export function ButtonLink({ href, children, variant = "primary" }: { href: string; children: React.ReactNode; variant?: "primary" | "ghost" }) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-10 items-center rounded-md px-4 py-2 text-sm font-semibold ${variant === "primary" ? "bg-seal text-flour hover:bg-seal-deep" : "border border-line bg-white hover:border-seal"}`}
    >
      {children}
    </Link>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "good" | "warn" | "bad" | "info"; children: React.ReactNode }) {
  const cls = {
    neutral: "bg-stone-100 text-stone-700",
    good: "bg-emerald-50 text-emerald-800",
    warn: "bg-amber-50 text-amber-800",
    bad: "bg-red-50 text-red-800",
    info: "bg-kashi/10 text-kashi-deep",
  }[tone];
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{children}</span>;
}

export function Table({ head, children, empty }: { head: string[]; children: React.ReactNode; empty?: string | false }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-white">
      <table className="w-full min-w-[40rem] text-sm">
        <thead className="bg-flour text-start text-xs text-muted">
          <tr>{head.map((h) => <th key={h} scope="col" className="px-3 py-2.5 text-start font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
      {empty && <p className="p-8 text-center text-muted">{empty}</p>}
    </div>
  );
}

export function FilterBar({ children }: { children: React.ReactNode }) {
  return <form method="get" className="mb-4 flex flex-wrap items-end gap-2 rounded-lg border border-line bg-white p-3">{children}</form>;
}

export { STATUS_LABEL, STATUS_TONE, RETAILER_STATUS_LABEL, RETAILER_STATUS_TONE, RETAILER_TYPE_LABEL, KIND_LABEL } from "./labels";

export function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("ar-IQ-u-nu-latn", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Baghdad" }).format(d);
}

export function sp(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
}
