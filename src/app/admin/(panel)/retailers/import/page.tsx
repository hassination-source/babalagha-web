import { requireUser } from "@/lib/auth";
import { RETAILER_CSV_COLUMNS } from "@/lib/csv";
import { GOVERNORATES } from "@/lib/iraq";
import { Card, PageHeader } from "@/components/admin/ui";
import { CsvImporter } from "@/components/admin/CsvImporter";

export const metadata = { title: "استيراد منافذ البيع" };

export default async function ImportRetailers() {
  await requireUser("retailers");
  return (
    <>
      <PageHeader title="استيراد منافذ البيع من CSV" back={{ href: "/admin/retailers", label: "منافذ البيع" }}>
        <a href="/admin/retailers/template" className="inline-flex min-h-10 items-center rounded-md border border-line bg-white px-4 text-sm font-semibold hover:border-seal">تنزيل القالب</a>
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <CsvImporter />
        <Card title="تعليمات">
          <ol className="list-decimal space-y-2 ps-5 text-sm">
            <li>نزّل القالب، أو افتح ملف Excel الحالي واحفظه بصيغة <strong>CSV UTF-8</strong> (ملف ← حفظ باسم).</li>
            <li>الأعمدة المطلوبة: <code dir="ltr">name_ar</code>، <code dir="ltr">governorate</code>، <code dir="ltr">city_ar</code>.</li>
            <li>المحافظة تُكتب بالعربية أو الإنجليزية أو بالرمز: {GOVERNORATES.slice(0, 4).map((g) => g.ar).join("، ")}…</li>
            <li><code dir="ltr">status</code>: PENDING أو ACTIVE أو INACTIVE. المنافذ بلا إحداثيات تُستورد «بانتظار المراجعة».</li>
            <li><code dir="ltr">verified</code>: true أو false.</li>
            <li>يظهر لك ملخص قبل الحفظ؛ لا يُحفظ شيء حتى تضغط «استيراد».</li>
          </ol>
          <p className="mt-4 text-xs text-muted" dir="ltr">{RETAILER_CSV_COLUMNS.join(", ")}</p>
        </Card>
      </div>
    </>
  );
}
