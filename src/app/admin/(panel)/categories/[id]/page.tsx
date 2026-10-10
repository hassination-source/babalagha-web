import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { saveCategory, deleteCategory } from "@/lib/actions/catalog";
import { Card, PageHeader } from "@/components/admin/ui";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { ActionForm, SubmitButton } from "@/components/admin/ActionForm";

export const metadata = { title: "تعديل قسم" };

export default async function EditCategory({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("catalog");
  const { id } = await params;
  const category = await db.category.findUnique({ where: { id } });
  if (!category) notFound();
  return (
    <>
      <PageHeader title={category.nameAr} back={{ href: "/admin/categories", label: "الأقسام" }} />
      <CategoryForm category={category} action={saveCategory.bind(null, id)} />
      <Card title="حذف القسم" className="mt-6">
        <ActionForm action={deleteCategory.bind(null, id)} confirm="حذف القسم نهائياً؟">
          <p className="text-sm text-muted">يمكن حذف القسم فقط إذا كان فارغاً.</p>
          <SubmitButton variant="danger">حذف</SubmitButton>
        </ActionForm>
      </Card>
    </>
  );
}
