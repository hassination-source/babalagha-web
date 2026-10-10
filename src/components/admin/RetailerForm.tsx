"use client";

import { useState } from "react";
import type { Retailer } from "@prisma/client";
import type { ActionResult } from "@/lib/admin";
import { GOVERNORATES } from "@/lib/iraq";
import { RetailerMap } from "@/components/map/RetailerMap";
import { ActionForm, AdminField, Check, SubmitButton, useFieldError } from "./ActionForm";
import { RETAILER_STATUS_LABEL, RETAILER_TYPE_LABEL } from "./labels";

/** Extracts coordinates from a pasted Google Maps / OpenStreetMap link or "lat, lng" text. */
export function parseCoords(input: string): { lat: number; lng: number } | null {
  const s = decodeURIComponent(input.trim());
  const patterns = [/@(-?\d+\.\d+),(-?\d+\.\d+)/, /[?&](?:q|query|ll|destination)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/, /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, /#map=\d+\/(-?\d+\.\d+)\/(-?\d+\.\d+)/, /^(-?\d+\.\d+)\s*[,،\s]\s*(-?\d+\.\d+)$/];
  for (const p of patterns) {
    const m = p.exec(s);
    if (m) {
      const lat = Number(m[1]);
      const lng = Number(m[2]);
      if (lat >= 28.5 && lat <= 37.6 && lng >= 38.5 && lng <= 49) return { lat, lng };
    }
  }
  return null;
}

function CoordFields({ lat, lng, setLat, setLng }: { lat: string; lng: string; setLat: (v: string) => void; setLng: (v: string) => void }) {
  const errLat = useFieldError("latitude");
  const errLng = useFieldError("longitude");
  const [paste, setPaste] = useState("");
  const [pasteErr, setPasteErr] = useState("");
  const value = lat && lng && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) ? { lat: Number(lat), lng: Number(lng) } : null;
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">انقر على الخريطة لتحديد موقع المنفذ، أو الصق رابط خرائط Google، أو اكتب الإحداثيات.</p>
      <RetailerMap
        points={[]}
        pickValue={value}
        onPick={(a, b) => {
          setLat(String(a));
          setLng(String(b));
        }}
        ariaLabel="اختيار موقع المنفذ"
        className="h-80 w-full overflow-hidden rounded-md border border-line"
      />
      <div className="flex flex-wrap items-end gap-2">
        <label className="grow">
          <span className="mb-1 block text-xs text-muted">رابط خرائط Google أو «lat, lng»</span>
          <input value={paste} onChange={(e) => setPaste(e.target.value)} dir="ltr" className="field !min-h-10 !py-2 text-sm" />
        </label>
        <button
          type="button"
          onClick={() => {
            const c = parseCoords(paste);
            if (!c) return setPasteErr("لم نتمكن من قراءة إحداثيات داخل العراق من هذا النص.");
            setPasteErr("");
            setLat(String(c.lat));
            setLng(String(c.lng));
          }}
          className="min-h-10 rounded-md border border-line bg-white px-3 text-sm font-semibold"
        >
          استخراج
        </button>
      </div>
      {pasteErr && <p className="text-sm text-red-700">{pasteErr}</p>}
      <div className="grid grid-cols-2 gap-3">
        <label>
          <span className="mb-1 block text-sm font-semibold">خط العرض (Latitude)</span>
          <input name="latitude" value={lat} onChange={(e) => setLat(e.target.value)} dir="ltr" inputMode="decimal" className="field !min-h-10 !py-2" aria-invalid={errLat ? true : undefined} />
          {errLat && <span className="text-sm text-red-700">{errLat}</span>}
        </label>
        <label>
          <span className="mb-1 block text-sm font-semibold">خط الطول (Longitude)</span>
          <input name="longitude" value={lng} onChange={(e) => setLng(e.target.value)} dir="ltr" inputMode="decimal" className="field !min-h-10 !py-2" aria-invalid={errLng ? true : undefined} />
          {errLng && <span className="text-sm text-red-700">{errLng}</span>}
        </label>
      </div>
      {(lat || lng) && (
        <button type="button" onClick={() => { setLat(""); setLng(""); }} className="text-sm text-red-700 hover:underline">مسح الإحداثيات</button>
      )}
    </div>
  );
}

export function RetailerForm({ retailer, action }: { retailer: Retailer | null; action: (fd: FormData) => Promise<ActionResult> }) {
  const [lat, setLat] = useState(retailer?.latitude?.toString() ?? "");
  const [lng, setLng] = useState(retailer?.longitude?.toString() ?? "");
  return (
    <ActionForm action={action} className="space-y-6">
      <section className="space-y-4 rounded-lg border border-line bg-white p-5">
        <h2 className="font-bold text-seal">بيانات المنفذ</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <AdminField label="الاسم بالعربية" name="nameAr" required defaultValue={retailer?.nameAr} />
          <AdminField label="الاسم بالإنجليزية" name="nameEn" dir="ltr" defaultValue={retailer?.nameEn} />
          <AdminField label="نوع المنفذ" name="type" as="select" defaultValue={retailer?.type ?? "SUPERMARKET"}>
            {Object.entries(RETAILER_TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </AdminField>
          <AdminField label="المحافظة" name="governorate" as="select" required defaultValue={retailer?.governorate ?? ""}>
            <option value="" disabled>اختر</option>
            {GOVERNORATES.map((g) => <option key={g.slug} value={g.slug}>{g.ar}</option>)}
          </AdminField>
          <AdminField label="المدينة (عربي)" name="cityAr" required defaultValue={retailer?.cityAr} />
          <AdminField label="City (English)" name="cityEn" dir="ltr" defaultValue={retailer?.cityEn} />
          <AdminField label="الحي / المنطقة (عربي)" name="districtAr" defaultValue={retailer?.districtAr} />
          <AdminField label="District (English)" name="districtEn" dir="ltr" defaultValue={retailer?.districtEn} />
          <AdminField label="العنوان التفصيلي (عربي)" name="addressAr" as="textarea" rows={2} defaultValue={retailer?.addressAr} />
          <AdminField label="Address (English)" name="addressEn" as="textarea" rows={2} dir="ltr" defaultValue={retailer?.addressEn} />
          <AdminField label="هاتف المنفذ" name="phone" dir="ltr" defaultValue={retailer?.phone} hint="يُنشر على الموقع" />
          <AdminField label="أوقات العمل" name="openingHours" defaultValue={retailer?.openingHours} placeholder="مثال: يومياً 8 صباحاً – 11 مساءً" />
          <AdminField label="ملاحظات حول توفّر المنتجات (عربي)" name="notesAr" as="textarea" rows={2} defaultValue={retailer?.notesAr} />
          <AdminField label="Availability notes (English)" name="notesEn" as="textarea" rows={2} dir="ltr" defaultValue={retailer?.notesEn} />
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-5">
        <h2 className="mb-3 font-bold text-seal">الموقع على الخريطة</h2>
        <CoordFields lat={lat} lng={lng} setLat={setLat} setLng={setLng} />
      </section>

      <section className="flex flex-wrap items-end gap-6 rounded-lg border border-line bg-white p-5">
        <div className="w-56">
          <AdminField label="الحالة" name="status" as="select" defaultValue={retailer?.status ?? "PENDING"}>
            {Object.entries(RETAILER_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </AdminField>
        </div>
        <Check name="verified" label="تم التحقق من المنفذ (يظهر شارة «منفذ موثّق»)" defaultChecked={retailer?.verified ?? false} />
      </section>

      <div className="sticky bottom-0 z-10 flex gap-2 border-t border-line bg-[#f6f2ea]/95 py-3 backdrop-blur">
        <SubmitButton>{retailer ? "حفظ التغييرات" : "إضافة المنفذ"}</SubmitButton>
      </div>
    </ActionForm>
  );
}
