import Link from "next/link";
import type { InquiryStatus, Prisma } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { GOVERNORATES, governorateName } from "@/lib/iraq";
import { getDictionary } from "@/lib/dictionary";
import { Badge, FilterBar, PageHeader, Table, fmtDate, sp, STATUS_LABEL, STATUS_TONE } from "@/components/admin/ui";

export const metadata = { title: "طلبات الشراكة" };

export default async function PartnersAdmin({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireUser("inquiries");
  const p = await searchParams;
  const status = sp(p.status) as InquiryStatus | "";
  const gov = sp(p.gov);
  const q = sp(p.q);
  const types = getDictionary("ar").form.businessTypes as Record<string, string>;
  const where: Prisma.PartnerApplicationWhereInput = {
    ...(status ? { status } : { status: { not: "ARCHIVED" } }),
    ...(gov ? { governorate: gov } : {}),
    ...(q ? { OR: [{ businessName: { contains: q, mode: "insensitive" } }, { contactName: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }, { cityDistrict: { contains: q, mode: "insensitive" } }] } : {}),
  };
  const rows = await db.partnerApplication.findMany({ where, orderBy: { createdAt: "desc" }, take: 500 });
  const qs = new URLSearchParams(Object.entries({ status, gov, q }).filter(([, v]) => v) as [string, string][]).toString();

  return (
    <>
      <PageHeader title="طلبات الشراكة والتوزيع">
        <a href={`/admin/partners/export${qs ? `?${qs}` : ""}`} className="inline-flex min-h-10 items-center rounded-md border border-line bg-white px-4 text-sm font-semibold hover:border-seal">تصدير CSV</a>
      </PageHeader>
      <FilterBar>
        <label className="grow">
          <span className="mb-1 block text-xs text-muted">بحث</span>
          <input name="q" defaultValue={q} className="field !min-h-10 !py-2" placeholder="اسم النشاط، المسؤول، الهاتف، المدينة" />
        </label>
        <label>
          <span className="mb-1 block text-xs text-muted">المحافظة</span>
          <select name="gov" defaultValue={gov} className="field !min-h-10 !py-2">
            <option value="">الكل</option>
            {GOVERNORATES.map((g) => <option key={g.slug} value={g.slug}>{g.ar}</option>)}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs text-muted">الحالة</span>
          <select name="status" defaultValue={status} className="field !min-h-10 !py-2">
            <option value="">غير المؤرشفة</option>
            {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <button className="min-h-10 rounded-md bg-seal px-4 text-sm font-semibold text-flour">تصفية</button>
      </FilterBar>
      <Table head={["النشاط", "النوع", "الموقع", "التاريخ", "الحالة"]} empty={rows.length === 0 && "لا توجد طلبات."}>
        {rows.map((r) => (
          <tr key={r.id} className={`hover:bg-flour/60 ${r.status === "NEW" ? "font-semibold" : ""}`}>
            <td className="px-3 py-2.5"><Link href={`/admin/partners/${r.id}`} className="text-seal hover:underline">{r.businessName}</Link><p className="text-xs font-normal text-muted">{r.contactName}</p></td>
            <td className="px-3 py-2.5 font-normal">{types[r.businessType] ?? r.businessType}</td>
            <td className="px-3 py-2.5 font-normal">{r.cityDistrict}، {governorateName(r.governorate, "ar")}</td>
            <td className="px-3 py-2.5 text-xs font-normal text-muted">{fmtDate(r.createdAt)}</td>
            <td className="px-3 py-2.5"><Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge></td>
          </tr>
        ))}
      </Table>
    </>
  );
}
