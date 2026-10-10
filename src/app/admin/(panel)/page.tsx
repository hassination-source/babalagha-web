import Link from "next/link";
import { requireUser, can } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, PageHeader, fmtDate, KIND_LABEL } from "@/components/admin/ui";

export const metadata = { title: "نظرة عامة" };

export default async function Overview({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireUser();
  const { denied } = await searchParams;
  const [activeProducts, byCategory, activeRetailers, demoRetailers, pendingRetailers, newInquiries, newPartners, latestInquiries, latestPartners] =
    await Promise.all([
      db.product.count({ where: { published: true } }),
      db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, nameAr: true, published: true, _count: { select: { products: { where: { published: true } } } } } }),
      db.retailer.count({ where: { status: "ACTIVE", isDemo: false } }),
      db.retailer.count({ where: { status: "ACTIVE", isDemo: true } }),
      db.retailer.count({ where: { status: "PENDING" } }),
      db.inquiry.count({ where: { status: "NEW" } }),
      db.partnerApplication.count({ where: { status: "NEW" } }),
      can(user.role, "inquiries") ? db.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 5 }) : [],
      can(user.role, "inquiries") ? db.partnerApplication.findMany({ orderBy: { createdAt: "desc" }, take: 5 }) : [],
    ]);
  const max = Math.max(1, ...byCategory.map((c) => c._count.products));

  const stats = [
    { label: "منتجات منشورة", value: activeProducts, href: "/admin/products?status=published" },
    { label: "منافذ بيع منشورة", value: activeRetailers, note: demoRetailers ? `+ ${demoRetailers} تجريبية` : undefined, href: "/admin/retailers?status=ACTIVE" },
    { label: "منافذ بانتظار المراجعة", value: pendingRetailers, href: "/admin/retailers?status=PENDING", attention: pendingRetailers > 0 },
    { label: "رسائل جديدة", value: newInquiries, href: "/admin/inquiries?status=NEW", attention: newInquiries > 0 },
    { label: "طلبات شراكة جديدة", value: newPartners, href: "/admin/partners?status=NEW", attention: newPartners > 0 },
  ];

  return (
    <>
      <PageHeader title={`أهلاً، ${user.name}`} />
      {denied && <p role="alert" className="mb-4 rounded-md bg-amber-50 px-4 py-3 text-amber-900">لا تملك صلاحية الوصول إلى تلك الصفحة.</p>}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className={`rounded-lg border bg-white p-4 hover:border-seal ${s.attention ? "border-gold" : "border-line"}`}>
            <p className="text-xs text-muted">{s.label}</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-3xl text-seal">{s.value}</p>
            {s.note && <p className="text-xs text-muted">{s.note}</p>}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card title="المنتجات المنشورة حسب القسم">
          <ul className="space-y-2.5">
            {byCategory.map((c) => (
              <li key={c.id}>
                <div className="flex justify-between text-sm">
                  <span>{c.nameAr} {!c.published && <span className="text-xs text-muted">(مخفي)</span>}</span>
                  <span className="font-semibold">{c._count.products}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-dough">
                  <div className="h-2 rounded-full bg-kashi" style={{ width: `${(c._count.products / max) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
        {can(user.role, "inquiries") && (
          <Card title="أحدث الطلبات">
            {latestInquiries.length + latestPartners.length === 0 ? (
              <p className="text-muted">لا توجد رسائل أو طلبات بعد.</p>
            ) : (
              <ul className="divide-y divide-line text-sm">
                {latestPartners.map((p) => (
                  <li key={p.id} className="py-2">
                    <Link href={`/admin/partners/${p.id}`} className="flex justify-between gap-3 hover:text-seal">
                      <span><span className="text-xs text-kashi-deep">شراكة · </span>{p.businessName}</span>
                      <span className="text-xs text-muted">{fmtDate(p.createdAt)}</span>
                    </Link>
                  </li>
                ))}
                {latestInquiries.map((i) => (
                  <li key={i.id} className="py-2">
                    <Link href={`/admin/inquiries/${i.id}`} className="flex justify-between gap-3 hover:text-seal">
                      <span><span className="text-xs text-kashi-deep">{KIND_LABEL[i.kind]} · </span>{i.name}</span>
                      <span className="text-xs text-muted">{fmtDate(i.createdAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
      </div>
    </>
  );
}
