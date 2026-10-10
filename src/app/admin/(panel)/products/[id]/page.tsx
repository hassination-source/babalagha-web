import Image from "next/image";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { saveProduct, deleteProduct, uploadProductImages, updateProductImage } from "@/lib/actions/catalog";
import { Badge, ButtonLink, Card, PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";
import { ActionForm, SubmitButton } from "@/components/admin/ActionForm";

export const metadata = { title: "تعديل منتج" };

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  await requireUser("catalog");
  const { id } = await params;
  const { created } = await searchParams;
  const [product, categories] = await Promise.all([
    db.product.findUnique({ where: { id }, include: { variants: { orderBy: { sortOrder: "asc" } }, images: { orderBy: { sortOrder: "asc" } }, category: true } }),
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, nameAr: true } }),
  ]);
  if (!product) notFound();

  return (
    <>
      <PageHeader title={product.nameAr} back={{ href: "/admin/products", label: "المنتجات" }}>
        {product.published ? <Badge tone="good">منشور</Badge> : <Badge>مسودة</Badge>}
        <ButtonLink href={`/admin/products/${id}/preview`} variant="ghost">معاينة</ButtonLink>
        {product.published && product.category.published && (
          <a href={`/ar/products/${product.slug}`} target="_blank" className="inline-flex min-h-10 items-center rounded-md border border-line bg-white px-4 text-sm font-semibold hover:border-seal">عرض على الموقع ↗</a>
        )}
      </PageHeader>
      {created && <p role="status" className="mb-4 rounded-md bg-kashi/10 px-4 py-3 text-kashi-deep">تم إنشاء المنتج كمسودة. أضف الصور ثم فعّل «منشور على الموقع».</p>}

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <ProductForm product={product} categories={categories} action={saveProduct.bind(null, id)} />

        <div className="space-y-6">
          <Card title="الصور">
            {product.images.length === 0 && <p className="mb-3 text-sm text-muted">لا توجد صور بعد. سيظهر مكانها «صورة بانتظار الاعتماد» على الموقع.</p>}
            <ul className="space-y-4">
              {product.images.map((img, i) => (
                <li key={img.id} className="rounded-md border border-line p-2">
                  <div className="relative aspect-[4/3] overflow-hidden rounded bg-dough">
                    <Image src={img.url} alt={img.altAr ?? ""} fill sizes="22rem" className="object-cover" />
                    {i === 0 && <span className="absolute start-2 top-2 rounded bg-seal px-2 py-0.5 text-xs text-flour">الرئيسية</span>}
                  </div>
                  <ActionForm action={updateProductImage.bind(null, img.id)} className="mt-2 space-y-2">
                    <input name="altAr" defaultValue={img.altAr ?? ""} placeholder="نص بديل (عربي)" aria-label="نص بديل بالعربية" className="field !min-h-9 !py-1.5 text-sm" />
                    <input name="altEn" defaultValue={img.altEn ?? ""} placeholder="Alt text (English)" aria-label="Alt text in English" dir="ltr" className="field !min-h-9 !py-1.5 text-sm" />
                    <div className="flex flex-wrap gap-2">
                      <SubmitButton variant="ghost" name="intent" value="alt">حفظ النص</SubmitButton>
                      {i > 0 && <SubmitButton variant="ghost" name="intent" value="first">اجعلها الرئيسية</SubmitButton>}
                      <SubmitButton variant="danger" name="intent" value="delete">حذف</SubmitButton>
                    </div>
                  </ActionForm>
                </li>
              ))}
            </ul>
            <ActionForm action={uploadProductImages.bind(null, id)} className="mt-4 space-y-2" resetOnSuccess>
              <label className="block text-sm font-semibold" htmlFor="images">رفع صور جديدة</label>
              <input id="images" name="images" type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/heic" multiple className="block w-full text-sm file:me-3 file:rounded file:border-0 file:bg-dough file:px-3 file:py-2" />
              <p className="text-xs text-muted">حتى 10 صور، 8 ميغابايت لكل صورة. تُحوَّل تلقائياً إلى WebP وتُزال بيانات الموقع (EXIF).</p>
              <SubmitButton>رفع</SubmitButton>
            </ActionForm>
          </Card>

          <Card title="منطقة الخطر">
            <ActionForm action={deleteProduct.bind(null, id)} confirm={`حذف «${product.nameAr}» نهائياً؟ لا يمكن التراجع.`}>
              <p className="text-sm text-muted">لإخفاء المنتج مؤقتاً، ألغِ «منشور على الموقع» بدلاً من حذفه.</p>
              <SubmitButton variant="danger">حذف المنتج</SubmitButton>
            </ActionForm>
          </Card>
        </div>
      </div>
    </>
  );
}
