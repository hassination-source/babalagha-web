"use client";

import type { Category, Product, ProductVariant } from "@prisma/client";
import { ActionForm, AdminField, Check, SubmitButton } from "./ActionForm";
import { RowsEditor } from "./RowsEditor";
import type { ActionResult } from "@/lib/admin";

type Full = Product & { variants: ProductVariant[] };

export function ProductForm({
  product,
  categories,
  action,
}: {
  product: Full | null;
  categories: Pick<Category, "id" | "nameAr">[];
  action: (fd: FormData) => Promise<ActionResult>;
}) {
  const nutrition = Array.isArray(product?.nutrition) ? (product!.nutrition as Record<string, string>[]) : [];
  return (
    <ActionForm action={action} className="space-y-6">
      <section className="space-y-4 rounded-lg border border-line bg-white p-5">
        <h2 className="font-bold text-seal">المعلومات الأساسية</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <AdminField label="الاسم بالعربية" name="nameAr" required defaultValue={product?.nameAr} />
          <AdminField label="الاسم بالإنجليزية" name="nameEn" required dir="ltr" defaultValue={product?.nameEn} />
          <AdminField label="الرابط المختصر (slug)" name="slug" required dir="ltr" defaultValue={product?.slug} hint="مثال: kleicha-with-dates — يظهر في رابط الصفحة" />
          <AdminField label="القسم" name="categoryId" as="select" required defaultValue={product?.categoryId ?? ""}>
            <option value="" disabled>اختر القسم</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.nameAr}</option>)}
          </AdminField>
          <AdminField label="الوصف بالعربية" name="descriptionAr" as="textarea" defaultValue={product?.descriptionAr} />
          <AdminField label="الوصف بالإنجليزية" name="descriptionEn" as="textarea" dir="ltr" defaultValue={product?.descriptionEn} />
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-line bg-white p-5">
        <h2 className="font-bold text-seal">العبوات والأحجام</h2>
        <RowsEditor
          name="variants"
          addLabel="إضافة عبوة أو حجم"
          initial={(product?.variants ?? []).map((v) => ({ labelAr: v.labelAr, labelEn: v.labelEn ?? "" }))}
          cols={[{ key: "labelAr", label: "بالعربية (مثال: كيس 8 قطع)" }, { key: "labelEn", label: "بالإنجليزية", dir: "ltr" }]}
        />
      </section>

      <section className="space-y-4 rounded-lg border border-line bg-white p-5">
        <div>
          <h2 className="font-bold text-seal">معلومات اختيارية</h2>
          <p className="text-sm text-muted">لا تُعرض إلا إذا أُدخلت. أدخل فقط معلومات موثّقة ومعتمدة من الشركة.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <AdminField label="المكوّنات (عربي)" name="ingredientsAr" as="textarea" defaultValue={product?.ingredientsAr} />
          <AdminField label="Ingredients (English)" name="ingredientsEn" as="textarea" dir="ltr" defaultValue={product?.ingredientsEn} />
          <AdminField label="مسبّبات الحساسية (عربي)" name="allergensAr" as="textarea" rows={2} defaultValue={product?.allergensAr} />
          <AdminField label="Allergens (English)" name="allergensEn" as="textarea" rows={2} dir="ltr" defaultValue={product?.allergensEn} />
          <AdminField label="طريقة الحفظ (عربي)" name="storageAr" as="textarea" rows={2} defaultValue={product?.storageAr} />
          <AdminField label="Storage (English)" name="storageEn" as="textarea" rows={2} dir="ltr" defaultValue={product?.storageEn} />
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold">القيم الغذائية</h3>
          <RowsEditor
            name="nutrition"
            addLabel="إضافة قيمة غذائية"
            initial={nutrition.map((n) => ({ labelAr: n.labelAr ?? "", labelEn: n.labelEn ?? "", value: n.value ?? "" }))}
            cols={[
              { key: "labelAr", label: "البند (مثال: الطاقة)" },
              { key: "labelEn", label: "Label (English)", dir: "ltr" },
              { key: "value", label: "القيمة (مثال: 250 kcal / 100g)", dir: "ltr", width: "basis-32" },
            ]}
          />
        </div>
      </section>

      <section className="flex flex-wrap items-end gap-6 rounded-lg border border-line bg-white p-5">
        <Check name="published" label="منشور على الموقع" defaultChecked={product?.published ?? false} />
        <Check name="featured" label="مميّز في الصفحة الرئيسية" defaultChecked={product?.featured ?? false} />
        <div className="w-32">
          <AdminField label="ترتيب العرض" name="sortOrder" type="number" defaultValue={product?.sortOrder ?? 0} />
        </div>
      </section>

      <div className="sticky bottom-0 z-10 -mx-1 flex gap-2 border-t border-line bg-[#f6f2ea]/95 px-1 py-3 backdrop-blur">
        <SubmitButton>{product ? "حفظ التغييرات" : "إنشاء المنتج"}</SubmitButton>
      </div>
    </ActionForm>
  );
}
