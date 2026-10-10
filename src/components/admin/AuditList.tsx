import { fmtDate } from "./ui";

const FIELD_LABEL: Record<string, string> = {
  nameAr: "الاسم", nameEn: "الاسم (إنجليزي)", status: "الحالة", verified: "موثّق", latitude: "خط العرض", longitude: "خط الطول",
  addressAr: "العنوان", cityAr: "المدينة", districtAr: "الحي", governorate: "المحافظة", phone: "الهاتف", openingHours: "أوقات العمل",
  type: "النوع", published: "منشور", featured: "مميّز", slug: "الرابط", categoryId: "القسم", sortOrder: "الترتيب", variants: "العبوات",
};

const ACTION_LABEL: Record<string, string> = {
  "retailer.create": "إنشاء", "retailer.update": "تعديل", "retailer.delete": "حذف", "retailer.import": "استيراد",
  "retailer.status.active": "نشر", "retailer.status.inactive": "تعطيل", "retailer.status.rejected": "رفض", "retailer.status.pending": "إعادة للمراجعة",
};

function fmt(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "نعم" : "لا";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export function AuditList({ logs }: { logs: { id: string; action: string; createdAt: Date; changes: unknown; user: { name: string } | null }[] }) {
  if (!logs.length) return <p className="text-sm text-muted">لا توجد تغييرات مسجّلة.</p>;
  return (
    <ol className="space-y-3 text-sm">
      {logs.map((l) => {
        const changes = l.changes && typeof l.changes === "object" ? Object.entries(l.changes as Record<string, unknown>) : [];
        return (
          <li key={l.id} className="border-b border-line pb-2 last:border-0">
            <p>
              <strong>{ACTION_LABEL[l.action] ?? l.action}</strong> — {l.user?.name ?? "النظام"}
              <span className="block text-xs text-muted">{fmtDate(l.createdAt)}</span>
            </p>
            {changes.length > 0 && (
              <ul className="mt-1 space-y-0.5 text-xs text-muted">
                {changes.slice(0, 8).map(([k, v]) => {
                  const isChange = typeof v === "object" && v !== null && "from" in v;
                  const ch = v as { from?: unknown; to?: unknown };
                  return (
                    <li key={k}>
                      {FIELD_LABEL[k] ?? k}: {isChange ? <>{fmt(ch.from)} ← {fmt(ch.to)}</> : fmt(v)}
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}
