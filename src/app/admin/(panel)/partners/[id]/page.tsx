import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { governorateName } from "@/lib/iraq";
import { getDictionary } from "@/lib/dictionary";
import { updateSubmission } from "@/lib/actions/inquiries";
import { Badge, Card, PageHeader, fmtDate, STATUS_LABEL, STATUS_TONE } from "@/components/admin/ui";
import { SubmissionUpdate } from "@/components/admin/SubmissionUpdate";

export const metadata = { title: "طلب شراكة" };

export default async function PartnerDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("inquiries");
  const { id } = await params;
  const r = await db.partnerApplication.findUnique({ where: { id }, include: { notes: { orderBy: { createdAt: "desc" } } } });
  if (!r) notFound();
  const f = getDictionary("ar").form;
  const cats = new Map((await db.category.findMany({ select: { slug: true, nameAr: true } })).map((c) => [c.slug, c.nameAr]));
  const rows: [string, React.ReactNode][] = [
    ["المسؤول", r.contactName],
    ["الهاتف", <a key="p" href={`tel:${r.phone}`} dir="ltr" className="text-kashi-deep underline">{r.phone}</a>],
    ...(r.email ? ([["البريد", <a key="e" href={`mailto:${r.email}`} dir="ltr" className="text-kashi-deep underline">{r.email}</a>]] as [string, React.ReactNode][]) : []),
    ["نوع النشاط", (f.businessTypes as Record<string, string>)[r.businessType] ?? r.businessType],
    ["الحجم", r.businessSize ? (f.businessSizes as Record<string, string>)[r.businessSize] ?? r.businessSize : "—"],
    ["المحافظة", governorateName(r.governorate, "ar")],
    ["المدينة والحي", r.cityDistrict],
    ["العنوان", r.location],
    ["الأقسام المطلوبة", r.interests.length ? r.interests.map((i) => cats.get(i) ?? i).join("، ") : "—"],
    ["التاريخ", fmtDate(r.createdAt)],
  ];
  return (
    <>
      <PageHeader title={r.businessName} back={{ href: "/admin/partners", label: "طلبات الشراكة" }}>
        <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <Card>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              {rows.map(([k, v]) => (
                <div key={k}><dt className="text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>
              ))}
            </dl>
            {r.message && <p className="mt-5 whitespace-pre-wrap border-t border-line pt-4 leading-relaxed">{r.message}</p>}
          </Card>
          <Card title="الملاحظات الداخلية">
            {r.notes.length === 0 ? <p className="text-sm text-muted">لا توجد ملاحظات.</p> : (
              <ul className="space-y-3 text-sm">
                {r.notes.map((n) => (
                  <li key={n.id} className="border-b border-line pb-2 last:border-0">
                    <p className="whitespace-pre-wrap">{n.body}</p>
                    <p className="mt-1 text-xs text-muted">{n.authorName} · {fmtDate(n.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
        <Card title="المتابعة">
          <SubmissionUpdate status={r.status} action={updateSubmission.bind(null, "partner", id)} />
        </Card>
      </div>
    </>
  );
}
