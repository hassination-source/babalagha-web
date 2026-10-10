import type { InquiryKind, InquiryStatus } from "@prisma/client";
import { getSessionUser, can } from "@/lib/auth";
import { db } from "@/lib/db";
import { toCsv } from "@/lib/csv";
import { audit } from "@/lib/audit";

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user || !can(user.role, "inquiries")) return new Response("Forbidden", { status: 403 });
  const u = new URL(req.url);
  const status = u.searchParams.get("status") as InquiryStatus | null;
  const kind = u.searchParams.get("kind") as InquiryKind | null;
  const rows = await db.inquiry.findMany({
    where: { ...(status ? { status } : {}), ...(kind ? { kind } : {}) },
    orderBy: { createdAt: "desc" },
  });
  await audit(user.id, "inquiry.export", "Inquiry", null, { count: rows.length });
  const csv = toCsv(
    ["created_at", "kind", "status", "name", "phone", "email", "subject", "message", "locale"],
    rows.map((r) => [r.createdAt.toISOString(), r.kind, r.status, r.name, r.phone, r.email, r.subject, r.message, r.locale]),
  );
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="babalagha-inquiries-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "no-store" },
  });
}
