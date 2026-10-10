import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { saveRetailer, setRetailerStatus, deleteRetailer } from "@/lib/actions/retailers";
import { Badge, Card, PageHeader, fmtDate, RETAILER_STATUS_LABEL, RETAILER_STATUS_TONE } from "@/components/admin/ui";
import { RetailerForm } from "@/components/admin/RetailerForm";
import { ActionForm, SubmitButton } from "@/components/admin/ActionForm";
import { AuditList } from "@/components/admin/AuditList";

export const metadata = { title: "تعديل منفذ" };

export default async function EditRetailer({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  await requireUser("retailers");
  const { id } = await params;
  const { created } = await searchParams;
  const [retailer, history] = await Promise.all([
    db.retailer.findUnique({ where: { id } }),
    db.auditLog.findMany({ where: { entity: "Retailer", entityId: id }, include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 50 }),
  ]);
  if (!retailer) notFound();
  const pending = retailer.status === "PENDING";

  return (
    <>
      <PageHeader title={retailer.nameAr} back={{ href: "/admin/retailers", label: "منافذ البيع" }}>
        <Badge tone={RETAILER_STATUS_TONE[retailer.status]}>{RETAILER_STATUS_LABEL[retailer.status]}</Badge>
        {retailer.isDemo && <Badge>بيانات تجريبية</Badge>}
      </PageHeader>
      {created && <p role="status" className="mb-4 rounded-md bg-kashi/10 px-4 py-3 text-kashi-deep">تمت إضافة المنفذ.</p>}

      {pending && (
        <Card title="مراجعة طلب الإضافة" className="mb-6 border-gold">
          {retailer.submittedBy && (
            <p className="mb-3 text-sm">
              مقدّم الطلب: <strong>{retailer.submittedBy}</strong>
              {retailer.submitterPhone && <> — <a href={`tel:${retailer.submitterPhone}`} dir="ltr" className="text-kashi-deep underline">{retailer.submitterPhone}</a></>}
              <span className="text-muted"> · {fmtDate(retailer.createdAt)}</span>
            </p>
          )}
          <p className="mb-3 text-sm text-muted">تحقق من البيانات وحدّد الموقع على الخريطة واحفظ، ثم انشر المنفذ. بيانات مقدّم الطلب لا تُنشر أبداً.</p>
          <div className="flex flex-wrap gap-2">
            <ActionForm action={setRetailerStatus.bind(null, id)} className="contents">
              <input type="hidden" name="status" value="ACTIVE" />
              <input type="hidden" name="verify" value="on" />
              <SubmitButton>اعتماد ونشر كمنفذ موثّق</SubmitButton>
            </ActionForm>
            <ActionForm action={setRetailerStatus.bind(null, id)} className="contents" confirm="رفض الطلب؟">
              <input type="hidden" name="status" value="REJECTED" />
              <SubmitButton variant="ghost">رفض</SubmitButton>
            </ActionForm>
          </div>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <RetailerForm retailer={retailer} action={saveRetailer.bind(null, id)} />
        <div className="space-y-6">
          <Card title="سجل التغييرات">
            <AuditList logs={history} />
          </Card>
          <Card title="حذف">
            <ActionForm action={deleteRetailer.bind(null, id)} confirm="حذف المنفذ نهائياً؟">
              <p className="text-sm text-muted">لإخفاء المنفذ مؤقتاً، غيّر حالته إلى «معطّل» بدلاً من حذفه.</p>
              <SubmitButton variant="danger">حذف المنفذ</SubmitButton>
            </ActionForm>
          </Card>
        </div>
      </div>
    </>
  );
}
