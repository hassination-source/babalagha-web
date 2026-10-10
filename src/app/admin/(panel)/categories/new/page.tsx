import { requireUser } from "@/lib/auth";
import { saveCategory } from "@/lib/actions/catalog";
import { PageHeader } from "@/components/admin/ui";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const metadata = { title: "قسم جديد" };

export default async function NewCategory() {
  await requireUser("catalog");
  return (
    <>
      <PageHeader title="قسم جديد" back={{ href: "/admin/categories", label: "الأقسام" }} />
      <CategoryForm category={null} action={saveCategory.bind(null, null)} />
    </>
  );
}
