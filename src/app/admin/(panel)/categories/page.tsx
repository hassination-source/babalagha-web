import Image from "next/image";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge, ButtonLink, PageHeader, Table } from "@/components/admin/ui";

export const metadata = { title: "الأقسام" };

export default async function CategoriesAdmin() {
  await requireUser("catalog");
  const cats = await db.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } });
  return (
    <>
      <PageHeader title="الأقسام">
        <ButtonLink href="/admin/categories/new">قسم جديد</ButtonLink>
      </PageHeader>
      <Table head={["", "القسم", "المنتجات", "الحالة", "الترتيب"]} empty={cats.length === 0 && "لا توجد أقسام."}>
        {cats.map((c) => (
          <tr key={c.id}>
            <td className="w-16 px-3 py-2">{c.imageUrl ? <Image src={c.imageUrl} alt="" width={48} height={48} className="size-12 rounded object-cover" /> : <span className="block size-12 rounded bg-dough" />}</td>
            <td className="px-3 py-2">
              <Link href={`/admin/categories/${c.id}`} className="font-semibold text-seal hover:underline">{c.nameAr}</Link>
              <p className="text-xs text-muted" dir="ltr">{c.nameEn}</p>
            </td>
            <td className="px-3 py-2">{c._count.products}</td>
            <td className="px-3 py-2">{c.published ? <Badge tone="good">ظاهر</Badge> : <Badge>مخفي</Badge>}</td>
            <td className="px-3 py-2 text-muted">{c.sortOrder}</td>
          </tr>
        ))}
      </Table>
    </>
  );
}
