"use client";

import Image from "next/image";
import type { Category } from "@prisma/client";
import type { ActionResult } from "@/lib/admin";
import { ActionForm, AdminField, Check, SubmitButton } from "./ActionForm";

export function CategoryForm({ category, action }: { category: Category | null; action: (fd: FormData) => Promise<ActionResult> }) {
  return (
    <ActionForm action={action} className="space-y-5 rounded-lg border border-line bg-white p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="الاسم بالعربية" name="nameAr" required defaultValue={category?.nameAr} />
        <AdminField label="الاسم بالإنجليزية" name="nameEn" required dir="ltr" defaultValue={category?.nameEn} />
        <AdminField label="الرابط المختصر (slug)" name="slug" required dir="ltr" defaultValue={category?.slug} />
        <AdminField label="ترتيب العرض" name="sortOrder" type="number" defaultValue={category?.sortOrder ?? 0} />
        <AdminField label="وصف قصير (عربي)" name="descriptionAr" as="textarea" rows={2} defaultValue={category?.descriptionAr} />
        <AdminField label="Short description (English)" name="descriptionEn" as="textarea" rows={2} dir="ltr" defaultValue={category?.descriptionEn} />
      </div>
      <div className="flex flex-wrap items-end gap-6">
        {category?.imageUrl && <Image src={category.imageUrl} alt="" width={120} height={90} className="h-24 w-32 rounded object-cover" />}
        <label className="text-sm">
          <span className="mb-1 block font-semibold">{category?.imageUrl ? "استبدال صورة القسم" : "صورة القسم"}</span>
          <input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="text-sm file:me-3 file:rounded file:border-0 file:bg-dough file:px-3 file:py-2" />
        </label>
        <Check name="published" label="ظاهر على الموقع" defaultChecked={category?.published ?? true} />
      </div>
      <SubmitButton>{category ? "حفظ" : "إنشاء القسم"}</SubmitButton>
    </ActionForm>
  );
}
