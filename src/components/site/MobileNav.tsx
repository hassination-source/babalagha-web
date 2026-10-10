"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function MobileNav({ items, menuLabel, closeLabel }: { items: { href: string; label: string }[]; menuLabel: string; closeLabel: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btn.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={btn}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-11 items-center justify-center rounded-full text-seal hover:bg-dough"
      >
        <span className="sr-only">{open ? closeLabel : menuLabel}</span>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h10" />}
        </svg>
      </button>
      <div
        id="mobile-nav"
        hidden={!open}
        className="fixed inset-x-0 top-[4.5rem] bottom-0 z-40 overflow-y-auto bg-flour"
      >
        <nav className="container-page py-6">
          <ul className="divide-y divide-line">
            {items.map((it) => {
              const active = pathname?.startsWith(it.href);
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    aria-current={active ? "page" : undefined}
                    className={`block py-4 font-[family-name:var(--font-display)] text-2xl ${active ? "text-kashi-deep" : "text-seal"}`}
                  >
                    {it.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="kashi-band mt-4" aria-hidden />
      </div>
    </div>
  );
}
