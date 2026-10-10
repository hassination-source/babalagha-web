import Image from "next/image";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { normalizeArabic } from "@/lib/catalog";
import { Badge, ButtonLink, FilterBar, PageHeader, Table, sp } from "@/components/admin/ui";

export const metadata = { title: "المنتجات" };

export default async function ProductsAdmin({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireUser("catalog");
  const params = await searchParams;
  const q = sp(params.q);
  const category = sp(params.category);
  const status = sp(params.status);
  const where: Prisma.ProductWhereInput = {
    ...(category ? { categoryId: category } : {}),
    ...(status === "published" ? { published: true } : status === "draft" ? { published: false } : status === "featured" ? { featured: true } : {}),
  };
  const [categories, all] = await Promise.all([
    db.category.findMany({ orderBy: { sortOrder: "asc" } }),
    db.product.findMany({
      where,
      include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    }),
  ]);
  const term = normalizeArabic(q);
  const products = term ? all.filter((p) => normalizeArabic(`${p.nameAr} ${p.nameEn} ${p.slug}`).includes(term)) : all;

  return (
    <>
      <PageHeader title="المنتجات">
        <ButtonLink href="/admin/products/new">منتج جديد</ButtonLink>
      </PageHeader>
      {params.deleted && <p role="status" className="mb-4 rounded-md bg-kashi/10 px-4 py-3 text-kashi-deep">تم حذف المنتج.</p>}
      <FilterBar>
        <label className="grow">
          <span className="mb-1 block text-xs text-muted">بحث</span>
          <input name="q" defaultValue={q} className="field !min-h-10 !py-2" placeholder="اسم المنتج أو الرابط" />
        </label>
        <label>
          <span className="mb-1 block text-xs text-muted">القسم</span>
          <select name="category" defaultValue={category} className="field !min-h-10 !py-2">
            <option value="">الكل</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.nameAr}</option>)}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs text-muted">الحالة</span>
          <select name="status" defaultValue={status} className="field !min-h-10 !py-2">
            <option value="">الكل</option>
            <option value="published">منشور</option>
            <option value="draft">مسودة</option>
            <option value="featured">مميّز</option>
          </select>
        </label>
        <button className="min-h-10 rounded-md bg-seal px-4 text-sm font-semibold text-flour">تصفية</button>
      </FilterBar>
      <p className="mb-2 text-sm text-muted">{products.length} منتج</p>
      <Table head={["", "المنتج", "القسم", "الحالة", "الترتيب"]} empty={products.length === 0 && "لا توجد منتجات مطابقة."}>
        {products.map((p) => (
          <tr key={p.id} className="hover:bg-flour/60">
            <td className="w-16 px-3 py-2">
              {p.images[0] ? (
                <Image src={p.images[0].url} alt="" width={48} height={48} className="size-12 rounded object-cover" />
              ) : (
                <span className="flex size-12 items-center justify-center rounded bg-dough text-[10px] text-muted">بلا صورة</span>
              )}
            </td>
            <td className="px-3 py-2">
              <Link href={`/admin/products/${p.id}`} className="font-semibold text-seal hover:underline">{p.nameAr}</Link>
              <p className="text-xs text-muted" dir="ltr">{p.nameEn}</p>
            </td>
            <td className="px-3 py-2">{p.category.nameAr}</td>
            <td className="space-x-1 px-3 py-2 rtl:space-x-reverse">
              {p.published ? <Badge tone="good">منشور</Badge> : <Badge>مسودة</Badge>}
              {p.featured && <Badge tone="info">مميّز</Badge>}
            </td>
            <td className="px-3 py-2 text-muted">{p.sortOrder}</td>
          </tr>
        ))}
      </Table>
    </>
  );
}
