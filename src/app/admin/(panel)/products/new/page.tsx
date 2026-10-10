import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { saveProduct } from "@/lib/actions/catalog";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "منتج جديد" };

export default async function NewProduct() {
  await requireUser("catalog");
  const categories = await db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, nameAr: true } });
  return (
    <>
      <PageHeader title="منتج جديد" back={{ href: "/admin/products", label: "المنتجات" }} />
      <ProductForm product={null} categories={categories} action={saveProduct.bind(null, null)} />
    </>
  );
}
