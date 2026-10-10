import Image from "next/image";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "تسجيل الدخول" };

export default async function LoginPage() {
  if (await getSessionUser()) redirect("/admin");
  return (
    <div className="flex min-h-dvh items-center justify-center p-5">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/brand/logo-seal.png" alt="" width={80} height={80} priority />
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-2xl text-seal">لوحة تحكم باب الآغا</h1>
        </div>
        <div className="rounded-lg border border-line bg-white p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
