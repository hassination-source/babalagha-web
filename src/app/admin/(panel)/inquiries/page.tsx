import Link from "next/link";
import type { InquiryKind, InquiryStatus, Prisma } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge, FilterBar, PageHeader, Table, fmtDate, sp, KIND_LABEL, STATUS_LABEL, STATUS_TONE } from "@/components/admin/ui";

export const metadata = { title: "رسائل التواصل" };

export default async function InquiriesAdmin({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireUser("inquiries");
  const p = await searchParams;
  const status = sp(p.status) as InquiryStatus | "";
  const kind = sp(p.kind) as InquiryKind | "";
  const q = sp(p.q);
  const where: Prisma.InquiryWhereInput = {
    ...(status ? { status } : { status: { not: "ARCHIVED" } }),
    ...(kind ? { kind } : {}),
    ...(q
      ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }, { email: { contains: q, mode: "insensitive" } }, { message: { contains: q, mode: "insensitive" } }, { subject: { contains: q, mode: "insensitive" } }] }
      : {}),
  };
  const rows = await db.inquiry.findMany({ where, orderBy: { createdAt: "desc" }, take: 500 });
  const qs = new URLSearchParams(Object.entries({ status, kind, q }).filter(([, v]) => v) as [string, string][]).toString();

  return (
    <>
      <PageHeader title="رسائل التواصل">
        <a href={`/admin/inquiries/export${qs ? `?${qs}` : ""}`} className="inline-flex min-h-10 items-center rounded-md border border-line bg-white px-4 text-sm font-semibold hover:border-seal">تصدير CSV</a>
      </PageHeader>
      <FilterBar>
        <label className="grow">
          <span className="mb-1 block text-xs text-muted">بحث</span>
          <input name="q" defaultValue={q} className="field !min-h-10 !py-2" placeholder="الاسم، الهاتف، نص الرسالة" />
        </label>
        <label>
          <span className="mb-1 block text-xs text-muted">النوع</span>
          <select name="kind" defaultValue={kind} className="field !min-h-10 !py-2">
            <option value="">الكل</option>
            {Object.entries(KIND_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
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
      <Table head={["المرسل", "النوع", "الموضوع", "التاريخ", "الحالة"]} empty={rows.length === 0 && "لا توجد رسائل."}>
        {rows.map((r) => (
          <tr key={r.id} className={`hover:bg-flour/60 ${r.status === "NEW" ? "font-semibold" : ""}`}>
            <td className="px-3 py-2.5"><Link href={`/admin/inquiries/${r.id}`} className="text-seal hover:underline">{r.name}</Link><p className="text-xs font-normal text-muted" dir="ltr">{r.phone}</p></td>
            <td className="px-3 py-2.5">{KIND_LABEL[r.kind]}</td>
            <td className="max-w-xs truncate px-3 py-2.5 font-normal">{r.subject || r.message.slice(0, 80)}</td>
            <td className="px-3 py-2.5 text-xs font-normal text-muted">{fmtDate(r.createdAt)}</td>
            <td className="px-3 py-2.5"><Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge></td>
          </tr>
        ))}
      </Table>
    </>
  );
}
