import Image from "next/image";
import Link from "next/link";
import { requireUser, can, type Permission } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";
import { db } from "@/lib/db";
import { AdminNav } from "@/components/admin/AdminNav";

const ROLE_LABEL = { ADMIN: "مدير النظام", EDITOR: "محرّر محتوى", SALES: "فريق المبيعات" } as const;

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [pendingRetailers, newInquiries, newPartners] = await Promise.all([
    can(user.role, "retailers") ? db.retailer.count({ where: { status: "PENDING" } }) : 0,
    can(user.role, "inquiries") ? db.inquiry.count({ where: { status: "NEW" } }) : 0,
    can(user.role, "inquiries") ? db.partnerApplication.count({ where: { status: "NEW" } }) : 0,
  ]);

  const items: { href: string; label: string; perm?: Permission; badge?: number }[] = [
    { href: "/admin", label: "نظرة عامة" },
    { href: "/admin/products", label: "المنتجات", perm: "catalog" },
    { href: "/admin/categories", label: "الأقسام", perm: "catalog" },
    { href: "/admin/retailers", label: "منافذ البيع", perm: "retailers", badge: pendingRetailers },
    { href: "/admin/inquiries", label: "رسائل التواصل", perm: "inquiries", badge: newInquiries },
    { href: "/admin/partners", label: "طلبات الشراكة", perm: "inquiries", badge: newPartners },
    { href: "/admin/content", label: "المحتوى والإعدادات", perm: "content" },
    { href: "/admin/users", label: "المستخدمون", perm: "users" },
    { href: "/admin/audit", label: "سجل التغييرات", perm: "audit" },
  ];
  const visible = items.filter((i) => !i.perm || can(user.role, i.perm));

  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[15rem_1fr]">
      <aside className="border-line bg-seal-deep text-flour/85 lg:sticky lg:top-0 lg:h-dvh lg:border-e">
        <div className="flex items-center justify-between gap-3 p-4 lg:block">
          <Link href="/admin" className="flex items-center gap-3">
            <Image src="/brand/logo-seal.png" alt="" width={40} height={40} />
            <span className="font-[family-name:var(--font-display)] text-lg text-flour">باب الآغا</span>
          </Link>
          <a href="/ar" target="_blank" className="text-xs text-gold hover:underline lg:mt-3 lg:inline-block">عرض الموقع ↗</a>
        </div>
        <AdminNav items={visible.map(({ href, label, badge }) => ({ href, label, badge }))} />
        <div className="border-t border-flour/10 p-4 text-sm lg:absolute lg:inset-x-0 lg:bottom-0">
          <p className="font-semibold text-flour">{user.name}</p>
          <p className="text-xs text-flour/60">{ROLE_LABEL[user.role]}</p>
          <form action={logout} className="mt-2">
            <button type="submit" className="text-gold hover:underline">تسجيل الخروج</button>
          </form>
        </div>
      </aside>
      <div className="min-w-0">
        <main className="mx-auto max-w-6xl p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
