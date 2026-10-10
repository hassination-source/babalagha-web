"use client";

import { useEffect, useRef, useState } from "react";

/** Renders children only once the placeholder scrolls near the viewport (keeps maps off the critical path). */
export function LazyMount({ children, fallback, rootMargin = "300px" }: { children: React.ReactNode; fallback: React.ReactNode; rootMargin?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    if (!("IntersectionObserver" in window)) return setShow(true);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [rootMargin]);
  return <div ref={ref} className="h-full">{show ? children : fallback}</div>;
}
