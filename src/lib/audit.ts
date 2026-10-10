import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "./db";

/** Returns only the fields that changed between two snapshots. */
export function diff(before: Record<string, unknown> | null, after: Record<string, unknown>) {
  const out: Record<string, { from: unknown; to: unknown }> = {};
  for (const [k, v] of Object.entries(after)) {
    if (k === "updatedAt" || k === "createdAt") continue;
    const prev = before?.[k];
    if (JSON.stringify(prev) !== JSON.stringify(v)) out[k] = { from: prev ?? null, to: v ?? null };
  }
  return out;
}

export async function audit(
  userId: string | null,
  action: string,
  entity: string,
  entityId: string | null,
  changes?: unknown,
) {
  await db.auditLog.create({
    data: { userId, action, entity, entityId, changes: (changes ?? undefined) as Prisma.InputJsonValue | undefined },
  });
}
