import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { db } from "./db";

export function hashIp(ip: string): string {
  const salt = process.env.SESSION_SECRET ?? "";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("cf-connecting-ip") ??
    h.get("x-real-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

/**
 * Fixed-window limiter stored in Postgres so it works across instances.
 * Returns true when the request is allowed.
 */
export async function rateLimit(bucket: string, limit: number, windowSeconds: number): Promise<boolean> {
  const ip = await clientIp();
  const key = `${bucket}:${hashIp(ip)}`;
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowSeconds * 1000);
  const rows = await db.$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimit" ("key", "count", "resetAt") VALUES (${key}, 1, ${resetAt})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimit"."resetAt" < ${now} THEN 1 ELSE "RateLimit"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimit"."resetAt" < ${now} THEN ${resetAt} ELSE "RateLimit"."resetAt" END
    RETURNING "count"`;
  return (rows[0]?.count ?? 0) <= limit;
}

/** Clears a bucket for the current client (e.g. after a successful login, so only failures count). */
export async function resetRateLimit(bucket: string): Promise<void> {
  const key = `${bucket}:${hashIp(await clientIp())}`;
  await db.rateLimit.deleteMany({ where: { key } });
}
