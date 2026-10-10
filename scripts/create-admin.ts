/**
 * Creates (or resets) an admin account.
 *
 *   ADMIN_EMAIL=you@babalagha.com ADMIN_PASSWORD='a long passphrase' ADMIN_NAME='Your Name' npm run admin:create
 *
 * Optional: ADMIN_ROLE=ADMIN|EDITOR|SALES (default ADMIN). Passwords must be at least 12 characters.
 */
import { PrismaClient, type Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  const name = process.env.ADMIN_NAME?.trim() || "Administrator";
  const role = (process.env.ADMIN_ROLE ?? "ADMIN") as Role;
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new Error("Set ADMIN_EMAIL");
  if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters");
  if (!["ADMIN", "EDITOR", "SALES"].includes(role)) throw new Error("ADMIN_ROLE must be ADMIN, EDITOR or SALES");
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await db.user.upsert({
    where: { email },
    update: { passwordHash, name, role, active: true },
    create: { email, passwordHash, name, role },
  });
  await db.session.deleteMany({ where: { userId: user.id } });
  console.log(`Admin ready: ${user.email} (${user.role})`);
}

main()
  .catch((e) => {
    console.error((e as Error).message);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
