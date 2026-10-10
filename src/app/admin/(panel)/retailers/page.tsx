import Link from "next/link";
import type { Prisma, RetailerStatus } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { GOVERNORATES, governorateName } from "@/lib/iraq";
import { normalizeArabic } from "@/lib/catalog";
import { setRetailerStatus } from "@/lib/actions/retailers";
import { Badge, ButtonLink, FilterBar, PageHeader, Table, RETAILER_STATUS_LABEL, RETAILER_STATUS_TONE, RETAILER_TYPE_LABEL, sp } from "@/components/admin/ui";
import { ActionForm, SubmitButton } from "@/components/admin/ActionForm";
import { AdminRetailerMap } from "@/components/admin/AdminRetailerMap";

export const metadata = { title: "منافذ البيع" };

export default async function RetailersAdmin({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireUser("retailers");
  const params = await searchParams;
  const status = sp(params.status) as RetailerStatus | "";
  const gov = sp(params.gov);
  const q = sp(params.q);
  const view = sp(params.view);
  const demo = sp(params.demo);
  const where: Prisma.RetailerWhereInput = {
    ...(status ? { status } : {}),
    ...(gov ? { governorate: gov } : {}),
    ...(demo === "hide" ? { isDemo: false } : demo === "only" ? { isDemo: true } : {}),
  };
  const all = await db.retailer.findMany({ where, orderBy: [{ status: "asc" }, { updatedAt: "desc" }], take: 2000 });
  const term = normalizeArabic(q);
  const rows = term
    ? all.filter((r) => normalizeArabic([r.nameAr, r.nameEn, r.cityAr, r.cityEn, r.districtAr, r.districtEn, r.addressAr, r.phone].filter(Boolean).join(" ")).includes(term))
    : all;
  const pendingCount = await db.retailer.count({ where: { status: "PENDING" } });
  const qs = new URLSearchParams(Object.entries({ status, gov, q, demo }).filter(([, v]) => v) as [string, string][]).toString();

  return (
    <>
      <PageHeader title="منافذ البيع">
        <ButtonLink href="/admin/retailers/import" variant="ghost">استيراد CSV</ButtonLink>
        <a href={`/admin/retailers/export${qs ? `?${qs}` : ""}`} className="inline-flex min-h-10 items-center rounded-md border border-line bg-white px-4 text-sm font-semibold hover:border-seal">تصدير CSV</a>
        <ButtonLink href="/admin/retailers/new">منفذ جديد</ButtonLink>
      </PageHeader>
      {params.deleted && <p role="status" className="mb-4 rounded-md bg-kashi/10 px-4 py-3 text-kashi-deep">تم حذف المنفذ.</p>}
      {pendingCount > 0 && status !== "PENDING" && (
        <Link href="/admin/retailers?status=PENDING" className="mb-4 block rounded-md border border-gold bg-gold/15 px-4 py-3 text-sm font-semibold hover:bg-gold/25">
          {pendingCount} طلب بانتظار المراجعة — راجعها الآن
        </Link>
      )}
      <FilterBar>
        <label className="grow">
          <span className="mb-1 block text-xs text-muted">بحث</span>
          <input name="q" defaultValue={q} className="field !min-h-10 !py-2" placeholder="الاسم، المدينة، الحي، الهاتف" />
        </label>
        <label>
          <span className="mb-1 block text-xs text-muted">الحالة</span>
          <select name="status" defaultValue={status} className="field !min-h-10 !py-2">
            <option value="">الكل</option>
            {Object.entries(RETAILER_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs text-muted">المحافظة</span>
          <select name="gov" defaultValue={gov} className="field !min-h-10 !py-2">
            <option value="">الكل</option>
            {GOVERNORATES.map((g) => <option key={g.slug} value={g.slug}>{g.ar}</option>)}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs text-muted">البيانات التجريبية</span>
          <select name="demo" defaultValue={demo} className="field !min-h-10 !py-2">
            <option value="">إظهار</option>
            <option value="hide">إخفاء</option>
            <option value="only">التجريبية فقط</option>
          </select>
        </label>
        <input type="hidden" name="view" value={view} />
        <button className="min-h-10 rounded-md bg-seal px-4 text-sm font-semibold text-flour">تصفية</button>
      </FilterBar>

      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted">{rows.length} منفذ</p>
        <div className="inline-flex rounded-md border border-line bg-white p-0.5 text-sm">
          <Link href={`?${new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(qs)), view: "" })}`} className={`rounded px-3 py-1.5 ${view !== "map" ? "bg-seal text-flour" : ""}`}>قائمة</Link>
          <Link href={`?${new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(qs)), view: "map" })}`} className={`rounded px-3 py-1.5 ${view === "map" ? "bg-seal text-flour" : ""}`}>خريطة</Link>
        </div>
      </div>

      {view === "map" ? (
        <AdminRetailerMap
          points={rows.filter((r) => r.latitude !== null && r.longitude !== null).map((r) => ({ id: r.id, lat: r.latitude!, lng: r.longitude!, label: r.nameAr, demo: r.isDemo }))}
          missing={rows.filter((r) => r.latitude === null || r.longitude === null).length}
        />
      ) : (
        <Table head={["المنفذ", "الموقع", "النوع", "الحالة", "إجراءات"]} empty={rows.length === 0 && "لا توجد منافذ مطابقة."}>
          {rows.map((r) => (
            <tr key={r.id} className="align-top hover:bg-flour/60">
              <td className="px-3 py-2.5">
                <Link href={`/admin/retailers/${r.id}`} className="font-semibold text-seal hover:underline">{r.nameAr}</Link>
                <div className="mt-1 flex flex-wrap gap-1">
                  {r.isDemo && <Badge>تجريبي</Badge>}
                  {r.verified && <Badge tone="info">موثّق</Badge>}
                  {(r.latitude === null || r.longitude === null) && <Badge tone="bad">بلا إحداثيات</Badge>}
                </div>
              </td>
              <td className="px-3 py-2.5">{[r.districtAr, r.cityAr, governorateName(r.governorate, "ar")].filter(Boolean).join("، ")}</td>
              <td className="px-3 py-2.5">{RETAILER_TYPE_LABEL[r.type]}</td>
              <td className="px-3 py-2.5"><Badge tone={RETAILER_STATUS_TONE[r.status]}>{RETAILER_STATUS_LABEL[r.status]}</Badge></td>
              <td className="px-3 py-2.5">
                {r.status === "PENDING" ? (
                  <div className="flex gap-1">
                    <Link href={`/admin/retailers/${r.id}`} className="inline-flex min-h-8 items-center rounded-md bg-seal px-3 text-xs font-semibold text-flour">مراجعة</Link>
                    <ActionForm action={setRetailerStatus.bind(null, r.id)} className="contents" confirm="رفض هذا الطلب؟">
                      <input type="hidden" name="status" value="REJECTED" />
                      <button className="min-h-8 rounded-md border border-line px-3 text-xs font-semibold text-red-700">رفض</button>
                    </ActionForm>
                  </div>
                ) : (
                  <Link href={`/admin/retailers/${r.id}`} className="text-sm text-kashi-deep hover:underline">تعديل</Link>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
