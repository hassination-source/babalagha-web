import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { saveUser } from "@/lib/actions/content";
import { Badge, Card, PageHeader, fmtDate } from "@/components/admin/ui";
import { ActionForm, AdminField, Check, SubmitButton } from "@/components/admin/ActionForm";

export const metadata = { title: "المستخدمون" };

const ROLES = { ADMIN: "مدير النظام — كل الصلاحيات", EDITOR: "محرّر — المنتجات والأقسام والمحتوى", SALES: "المبيعات — منافذ البيع والرسائل والشراكات" };

export default async function UsersAdmin() {
  const me = await requireUser("users");
  const users = await db.user.findMany({ orderBy: [{ active: "desc" }, { createdAt: "asc" }] });
  return (
    <>
      <PageHeader title="المستخدمون والصلاحيات" />
      <div className="space-y-4">
        {users.map((u) => (
          <Card key={u.id}>
            <ActionForm action={saveUser.bind(null, u.id)} className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <strong className="text-seal">{u.name}</strong>
                {u.id === me.id && <Badge tone="info">أنت</Badge>}
                {!u.active && <Badge tone="bad">معطّل</Badge>}
                <span className="text-xs text-muted">آخر دخول: {u.lastLoginAt ? fmtDate(u.lastLoginAt) : "—"}</span>
              </div>
              <div className="grid gap-3 md:grid-cols-4">
                <AdminField label="الاسم" name="name" defaultValue={u.name} required />
                <AdminField label="البريد" name="email" type="email" dir="ltr" defaultValue={u.email} required />
                <AdminField label="الدور" name="role" as="select" defaultValue={u.role}>
                  {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </AdminField>
                <AdminField label="كلمة مرور جديدة" name="password" type="password" dir="ltr" hint="اتركها فارغة للإبقاء على الحالية" />
              </div>
              <div className="flex items-center gap-4">
                <Check name="active" label="الحساب فعّال" defaultChecked={u.active} />
                <SubmitButton variant="ghost">حفظ</SubmitButton>
              </div>
            </ActionForm>
          </Card>
        ))}
        <Card title="مستخدم جديد">
          <ActionForm action={saveUser.bind(null, null)} resetOnSuccess className="space-y-3">
            <div className="grid gap-3 md:grid-cols-4">
              <AdminField label="الاسم" name="name" required />
              <AdminField label="البريد" name="email" type="email" dir="ltr" required />
              <AdminField label="الدور" name="role" as="select" defaultValue="EDITOR">
                {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </AdminField>
              <AdminField label="كلمة المرور" name="password" type="password" dir="ltr" required hint="12 حرفاً على الأقل" />
            </div>
            <SubmitButton>إنشاء</SubmitButton>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
