"use client";

import { useRouter } from "next/navigation";
import { RetailerMap, type MapPoint } from "@/components/map/RetailerMap";

export function AdminRetailerMap({ points, missing }: { points: MapPoint[]; missing: number }) {
  const router = useRouter();
  return (
    <div>
      {missing > 0 && <p className="mb-2 text-sm text-amber-800">{missing} منفذ بلا إحداثيات لا يظهر على الخريطة.</p>}
      <RetailerMap points={points} onSelect={(id) => router.push(`/admin/retailers/${id}`)} ariaLabel="خريطة منافذ البيع" className="h-[36rem] w-full overflow-hidden rounded-lg border border-line" />
    </div>
  );
}

