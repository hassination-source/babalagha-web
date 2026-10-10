"use server";

import { redirect } from "next/navigation";
import { db } from "../db";
import { createSession, destroySession, getSessionUser, verifyPassword, dummyHash } from "../auth";
import { rateLimit, resetRateLimit } from "../rate-limit";
import { audit } from "../audit";


export async function login(_prev: { error: string }, form: FormData): Promise<{ error: string }> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!(await rateLimit("login", 8, 900))) return { error: "محاولات كثيرة. حاول بعد 15 دقيقة." };
  if (!email || !password) return { error: "أدخل البريد الإلكتروني وكلمة المرور." };

  const user = await db.user.findUnique({ where: { email } });
  const ok = await verifyPassword(password, user?.passwordHash ?? (await dummyHash()));
  if (!user || !ok || !user.active) return { error: "بيانات الدخول غير صحيحة." };

  await resetRateLimit("login");
  await createSession(user.id);
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await audit(user.id, "user.login", "User", user.id);
  redirect("/admin");
}

export async function logout() {
  const user = await getSessionUser();
  await destroySession();
  if (user) await audit(user.id, "user.logout", "User", user.id);
  redirect("/admin/login");
}
