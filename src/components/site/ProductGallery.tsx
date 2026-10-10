"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({ images, label, placeholder }: { images: { url: string; alt: string }[]; label: string; placeholder: string }) {
  const [i, setI] = useState(0);
  const current = images[i];
  if (!current) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center rounded-[var(--radius-soft)] bg-dough text-muted md:aspect-[5/4]">
        <span className="rounded border border-dashed border-muted/40 px-3 py-2 text-sm">{placeholder}</span>
      </div>
    );
  }
  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-soft)] bg-dough md:aspect-[5/4]">
        <Image key={current.url} src={current.url} alt={current.alt} fill priority sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" />
      </div>
      {images.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto" aria-label={label}>
          {images.map((im, idx) => (
            <li key={im.url}>
              <button
                type="button"
                onClick={() => setI(idx)}
                aria-current={idx === i}
                aria-label={`${idx + 1} / ${images.length}`}
                className={`relative block size-20 overflow-hidden rounded-[var(--radius-soft)] border-2 ${idx === i ? "border-seal" : "border-transparent opacity-80 hover:opacity-100"}`}
              >
                <Image src={im.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
