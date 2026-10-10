import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import type { Role, User } from "@prisma/client";
import { db } from "./db";
import { hashIp, clientIp } from "./rate-limit";

export const SESSION_COOKIE = "ba_session";
const SESSION_DAYS = 7;

export type SessionUser = Pick<User, "id" | "email" | "name" | "role">;

/** Which roles may perform which area of work. ADMIN can do everything. */
export const PERMISSIONS = {
  catalog: ["ADMIN", "EDITOR"],
  content: ["ADMIN", "EDITOR"],
  retailers: ["ADMIN", "SALES"],
  inquiries: ["ADMIN", "SALES"],
  users: ["ADMIN"],
  audit: ["ADMIN"],
} as const satisfies Record<string, readonly Role[]>;
export type Permission = keyof typeof PERMISSIONS;

export function can(role: Role, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

function sha256(v: string) {
  return createHash("sha256").update(v).digest("hex");
}

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 12);
}

let dummy: Promise<string> | null = null;
/** A real hash to compare against when the account does not exist, so timing does not reveal valid emails. */
export function dummyHash() {
  dummy ??= bcrypt.hash("not-a-real-password", 12);
  return dummy;
}

export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000);
  const h = await headers();
  await db.session.create({
    data: {
      tokenHash: sha256(token),
      userId,
      expiresAt,
      ipHash: hashIp(await clientIp()),
      userAgent: h.get("user-agent")?.slice(0, 200) ?? null,
    },
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: sha256(token) } });
  jar.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { tokenHash: sha256(token) },
    include: { user: { select: { id: true, email: true, name: true, role: true, active: true } } },
  });
  if (!session || session.expiresAt < new Date() || !session.user.active) return null;
  const { active: _active, ...user } = session.user;
  return user;
}

/** Use at the top of every admin page and server action. */
export async function requireUser(permission?: Permission): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  if (permission && !can(user.role, permission)) redirect("/admin?denied=1");
  return user;
}
