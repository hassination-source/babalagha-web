"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav({ items }: { items: { href: string; label: string; badge?: number }[] }) {
  const path = usePathname();
  return (
    <nav aria-label="لوحة التحكم" className="overflow-x-auto px-2 pb-3 lg:px-3">
      <ul className="flex gap-1 lg:flex-col">
        {items.map((it) => {
          const active = it.href === "/admin" ? path === "/admin" : path?.startsWith(it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-10 items-center justify-between gap-3 whitespace-nowrap rounded-md px-3 py-2 ${active ? "bg-flour/12 font-semibold text-flour" : "hover:bg-flour/8 hover:text-flour"}`}
              >
                {it.label}
                {it.badge ? <span className="rounded-full bg-gold px-2 text-xs font-bold text-seal-deep">{it.badge}</span> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
