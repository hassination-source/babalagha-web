"use client";

import { useRouter } from "next/navigation";
import { LazyMount } from "./LazyMount";
import { RetailerMap, type MapPoint } from "./RetailerMap";

export function HomeRetailerMap({ points, locale, label, loading }: { points: MapPoint[]; locale: string; label: string; loading: string }) {
  const router = useRouter();
  return (
    <LazyMount fallback={<div className="flex h-full min-h-[24rem] items-center justify-center text-flour/60">{loading}</div>}>
      <RetailerMap
        points={points}
        ariaLabel={label}
        onSelect={(id) => router.push(`/${locale}/retailers?id=${id}`)}
        className="h-full min-h-[24rem] w-full"
      />
    </LazyMount>
  );
}
