import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { FilterBar, PageHeader, Table, fmtDate, sp } from "@/components/admin/ui";

export const metadata = { title: "سجل التغييرات" };

export default async function AuditAdmin({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireUser("audit");
  const p = await searchParams;
  const entity = sp(p.entity);
  const logs = await db.auditLog.findMany({
    where: entity ? { entity } : {},
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 300,
  });
  const entities = await db.auditLog.findMany({ distinct: ["entity"], select: { entity: true } });
  return (
    <>
      <PageHeader title="سجل التغييرات" />
      <FilterBar>
        <label>
          <span className="mb-1 block text-xs text-muted">النوع</span>
          <select name="entity" defaultValue={entity} className="field !min-h-10 !py-2">
            <option value="">الكل</option>
            {entities.map((e) => <option key={e.entity} value={e.entity}>{e.entity}</option>)}
          </select>
        </label>
        <button className="min-h-10 rounded-md bg-seal px-4 text-sm font-semibold text-flour">تصفية</button>
      </FilterBar>
      <Table head={["الوقت", "المستخدم", "الإجراء", "السجل", "التفاصيل"]} empty={logs.length === 0 && "لا توجد سجلات."}>
        {logs.map((l) => (
          <tr key={l.id} className="align-top">
            <td className="whitespace-nowrap px-3 py-2 text-xs text-muted">{fmtDate(l.createdAt)}</td>
            <td className="px-3 py-2">{l.user?.name ?? "—"}</td>
            <td className="px-3 py-2 font-mono text-xs" dir="ltr">{l.action}</td>
            <td className="px-3 py-2 text-xs" dir="ltr">{l.entity}{l.entityId ? ` · ${l.entityId.slice(-6)}` : ""}</td>
            <td className="max-w-md px-3 py-2 text-xs text-muted" dir="ltr">
              {l.changes ? <code className="line-clamp-3 break-all">{JSON.stringify(l.changes)}</code> : null}
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
