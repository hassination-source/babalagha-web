import type { InquiryStatus } from "@prisma/client";
import { getSessionUser, can } from "@/lib/auth";
import { db } from "@/lib/db";
import { toCsv } from "@/lib/csv";
import { audit } from "@/lib/audit";

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user || !can(user.role, "inquiries")) return new Response("Forbidden", { status: 403 });
  const u = new URL(req.url);
  const status = u.searchParams.get("status") as InquiryStatus | null;
  const gov = u.searchParams.get("gov");
  const rows = await db.partnerApplication.findMany({
    where: { ...(status ? { status } : {}), ...(gov ? { governorate: gov } : {}) },
    orderBy: { createdAt: "desc" },
  });
  await audit(user.id, "partner.export", "PartnerApplication", null, { count: rows.length });
  const csv = toCsv(
    ["created_at", "status", "business_name", "contact_name", "phone", "email", "governorate", "city_district", "business_type", "business_size", "location", "interests", "message"],
    rows.map((r) => [r.createdAt.toISOString(), r.status, r.businessName, r.contactName, r.phone, r.email, r.governorate, r.cityDistrict, r.businessType, r.businessSize, r.location, r.interests.join("|"), r.message]),
  );
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="babalagha-partners-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "no-store" },
  });
}
