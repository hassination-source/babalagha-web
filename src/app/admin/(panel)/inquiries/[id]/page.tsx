import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateSubmission } from "@/lib/actions/inquiries";
import { Badge, Card, PageHeader, fmtDate, KIND_LABEL, STATUS_LABEL, STATUS_TONE } from "@/components/admin/ui";
import { SubmissionUpdate } from "@/components/admin/SubmissionUpdate";

export const metadata = { title: "رسالة" };

export default async function InquiryDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("inquiries");
  const { id } = await params;
  const r = await db.inquiry.findUnique({ where: { id }, include: { notes: { orderBy: { createdAt: "desc" } } } });
  if (!r) notFound();
  return (
    <>
      <PageHeader title={r.subject || KIND_LABEL[r.kind]} back={{ href: "/admin/inquiries", label: "رسائل التواصل" }}>
        <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <Card>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-muted">الاسم</dt><dd className="font-semibold">{r.name}</dd></div>
              <div><dt className="text-muted">الهاتف</dt><dd><a href={`tel:${r.phone}`} dir="ltr" className="text-kashi-deep underline">{r.phone}</a></dd></div>
              {r.email && <div><dt className="text-muted">البريد</dt><dd><a href={`mailto:${r.email}`} dir="ltr" className="text-kashi-deep underline">{r.email}</a></dd></div>}
              <div><dt className="text-muted">النوع</dt><dd>{KIND_LABEL[r.kind]}</dd></div>
              <div><dt className="text-muted">التاريخ</dt><dd>{fmtDate(r.createdAt)}</dd></div>
              <div><dt className="text-muted">لغة الموقع</dt><dd>{r.locale === "en" ? "English" : "العربية"}</dd></div>
            </dl>
            <p className="mt-5 whitespace-pre-wrap border-t border-line pt-4 leading-relaxed">{r.message}</p>
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
          <SubmissionUpdate status={r.status} action={updateSubmission.bind(null, "inquiry", id)} />
        </Card>
      </div>
    </>
  );
}
