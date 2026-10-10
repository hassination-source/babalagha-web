"use server";

import type { InquiryStatus } from "@prisma/client";
import { db } from "../db";
import { requireUser } from "../auth";
import { audit } from "../audit";
import { fail, str, type ActionResult } from "../admin";

const STATUSES: InquiryStatus[] = ["NEW", "IN_PROGRESS", "RESOLVED", "ARCHIVED"];

export async function updateSubmission(kind: "inquiry" | "partner", id: string, form: FormData): Promise<ActionResult> {
  const user = await requireUser("inquiries");
  const status = str(form, "status") as InquiryStatus;
  const note = str(form, "note").slice(0, 4000);
  if (status && !STATUSES.includes(status)) return fail("حالة غير صالحة.");
  if (!status && !note) return fail("لا يوجد تغيير لحفظه.");

  const entity = kind === "inquiry" ? "Inquiry" : "PartnerApplication";
  const current =
    kind === "inquiry"
      ? await db.inquiry.findUnique({ where: { id }, select: { status: true } })
      : await db.partnerApplication.findUnique({ where: { id }, select: { status: true } });
  if (!current) return fail("السجل غير موجود.");

  if (status && status !== current.status) {
    if (kind === "inquiry") await db.inquiry.update({ where: { id }, data: { status } });
    else await db.partnerApplication.update({ where: { id }, data: { status } });
    await audit(user.id, `${kind}.status`, entity, id, { status: { from: current.status, to: status } });
  }
  if (note) {
    await db.inquiryNote.create({
      data: { body: note, authorName: user.name, ...(kind === "inquiry" ? { inquiryId: id } : { partnerApplicationId: id }) },
    });
    await audit(user.id, `${kind}.note`, entity, id);
  }
  return { ok: true, message: "تم الحفظ." };
}
