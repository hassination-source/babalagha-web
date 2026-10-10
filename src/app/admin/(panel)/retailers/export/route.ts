import type { Prisma, RetailerStatus } from "@prisma/client";
import { getSessionUser, can } from "@/lib/auth";
import { db } from "@/lib/db";
import { retailersToCsv } from "@/lib/csv";
import { audit } from "@/lib/audit";

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user || !can(user.role, "retailers")) return new Response("Forbidden", { status: 403 });
  const url = new URL(req.url);
  const status = url.searchParams.get("status") as RetailerStatus | null;
  const gov = url.searchParams.get("gov");
  const demo = url.searchParams.get("demo");
  const where: Prisma.RetailerWhereInput = {
    ...(status ? { status } : {}),
    ...(gov ? { governorate: gov } : {}),
    ...(demo === "only" ? { isDemo: true } : demo === "hide" ? { isDemo: false } : {}),
  };
  const rows = await db.retailer.findMany({ where, orderBy: [{ governorate: "asc" }, { cityAr: "asc" }, { nameAr: "asc" }] });
  await audit(user.id, "retailer.export", "Retailer", null, { count: rows.length });
  const date = new Date().toISOString().slice(0, 10);
  return new Response(retailersToCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="babalagha-retailers-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
