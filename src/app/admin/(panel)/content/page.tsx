import Image from "next/image";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { CONTENT_DEFAULTS, SETTING_DEFAULTS, type ContentKey } from "@/lib/content";
import { saveContentBlocks, saveSettings, uploadHeroImage, saveTimelineEntry, addGalleryImage, updateGalleryImage } from "@/lib/actions/content";
import { Card, PageHeader } from "@/components/admin/ui";
import { ActionForm, AdminField, Check, SubmitButton } from "@/components/admin/ActionForm";

export const metadata = { title: "المحتوى والإعدادات" };

const LABELS: Record<ContentKey, string> = {
  "brand.slogan": "الشعار",
  "home.hero.eyebrow": "الرئيسية — سطر أعلى العنوان",
  "home.hero.title": "الرئيسية — العنوان الرئيسي",
  "home.hero.subtitle": "الرئيسية — النص التعريفي",
  "home.story.title": "الحكاية — العنوان",
  "home.story.body": "الحكاية — النص (يظهر أيضاً في صفحة حكايتنا)",
  "home.retailers.title": "منافذ البيع — العنوان",
  "home.retailers.body": "منافذ البيع — النص",
  "home.quality.title": "الحِرفة — العنوان",
  "home.quality.body": "الحِرفة — النص",
  "home.partners.title": "الشراكات — العنوان",
  "home.partners.body": "الشراكات — النص",
  "about.closing": "صفحة حكايتنا — الخاتمة",
  "footer.description": "التذييل — وصف قصير",
};

const SETTING_LABELS: Partial<Record<keyof typeof SETTING_DEFAULTS, string>> = {
  "contact.phone.customer": "هاتف خدمة الزبائن",
  "contact.phone.sales": "هاتف المبيعات",
  "contact.phone.management": "هاتف الإدارة",
  "contact.whatsapp": "رقم واتساب (اتركه فارغاً لإخفاء الزر)",
  "contact.email": "البريد الإلكتروني",
  "contact.address.ar": "العنوان (عربي)",
  "contact.address.en": "Address (English)",
  "contact.hours.ar": "أوقات العمل (عربي)",
  "contact.hours.en": "Opening hours (English)",
  "social.facebook": "رابط فيسبوك",
  "social.instagram": "رابط إنستغرام",
};

export default async function ContentAdmin() {
  await requireUser("content");
  const [blocks, settings, timeline, gallery] = await Promise.all([
    db.contentBlock.findMany(),
    db.setting.findMany(),
    db.timelineEntry.findMany({ orderBy: [{ year: "asc" }, { sortOrder: "asc" }] }),
    db.galleryImage.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  const bmap = new Map(blocks.map((b) => [b.key, b]));
  const smap = new Map(settings.map((s) => [s.key, s.value]));
  const setting = (k: keyof typeof SETTING_DEFAULTS) => smap.get(k) ?? SETTING_DEFAULTS[k];

  return (
    <>
      <PageHeader title="المحتوى والإعدادات" />
      <nav className="mb-6 flex flex-wrap gap-2 text-sm">
        {[["#texts", "النصوص"], ["#hero", "صورة الواجهة"], ["#settings", "معلومات التواصل"], ["#timeline", "المحطات التاريخية"], ["#gallery", "معرض الصور"]].map(([h, l]) => (
          <a key={h} href={h} className="rounded-full border border-line bg-white px-3 py-1.5 hover:border-seal">{l}</a>
        ))}
      </nav>

      <div className="space-y-8">
        <Card title="النصوص (العربية والإنجليزية تُحرّران بشكل مستقل)" className="scroll-mt-6">
          <span id="texts" />
          <ActionForm action={saveContentBlocks} className="space-y-6">
            {(Object.keys(CONTENT_DEFAULTS) as ContentKey[]).map((key) => {
              const b = bmap.get(key);
              const long = CONTENT_DEFAULTS[key].ar.length > 80;
              return (
                <fieldset key={key} className="grid gap-3 border-b border-line pb-5 md:grid-cols-2">
                  <legend className="mb-2 text-sm font-bold text-seal">{LABELS[key]}</legend>
                  <AdminField label="العربية" name={`${key}.ar`} as={long ? "textarea" : undefined} rows={long ? 4 : undefined} defaultValue={b?.valueAr || CONTENT_DEFAULTS[key].ar} />
                  <AdminField label="English" name={`${key}.en`} as={long ? "textarea" : undefined} rows={long ? 4 : undefined} dir="ltr" defaultValue={b?.valueEn || CONTENT_DEFAULTS[key].en} />
                </fieldset>
              );
            })}
            <p className="text-xs text-muted">اترك الحقل فارغاً للعودة إلى النص الافتراضي.</p>
            <SubmitButton>حفظ النصوص</SubmitButton>
          </ActionForm>
        </Card>

        <Card title="صورة الواجهة الرئيسية" className="scroll-mt-6">
          <span id="hero" />
          <div className="flex flex-wrap items-start gap-5">
            <Image src={setting("home.hero.image")} alt="" width={200} height={250} className="h-56 w-44 rounded object-cover" />
            <ActionForm action={uploadHeroImage} className="space-y-3">
              <input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="block text-sm file:me-3 file:rounded file:border-0 file:bg-dough file:px-3 file:py-2" />
              <p className="text-xs text-muted">صورة عمودية (نسبة 4:5 تقريباً) لمنتج حقيقي من باب الآغا. تُقصّ على شكل قوس.</p>
              <div className="flex gap-2">
                <SubmitButton name="intent" value="upload">رفع واستبدال</SubmitButton>
                <SubmitButton variant="ghost" name="intent" value="reset">استعادة الافتراضية</SubmitButton>
              </div>
            </ActionForm>
          </div>
        </Card>

        <Card title="معلومات التواصل والروابط" className="scroll-mt-6">
          <span id="settings" />
          <ActionForm action={saveSettings} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {(Object.keys(SETTING_LABELS) as (keyof typeof SETTING_DEFAULTS)[]).map((k) => (
                <AdminField key={k} label={SETTING_LABELS[k]!} name={k} defaultValue={setting(k)} dir={/phone|whatsapp|email|social|\.en$/.test(k) ? "ltr" : undefined} />
              ))}
            </div>
            <div className="rounded-md border border-dashed border-crust/50 bg-crust/5 p-3">
              <Check name="locator.showDemo" label="إظهار منافذ البيع التجريبية على الموقع العام (للتطوير فقط — ألغِه قبل الإطلاق)" defaultChecked={setting("locator.showDemo") === "true"} />
            </div>
            <SubmitButton>حفظ الإعدادات</SubmitButton>
          </ActionForm>
        </Card>

        <Card title="المحطات التاريخية" className="scroll-mt-6">
          <span id="timeline" />
          <div className="space-y-3">
            {timeline.map((e) => (
              <ActionForm key={e.id} action={saveTimelineEntry.bind(null, e.id)} className="grid items-end gap-2 rounded-md border border-line p-3 md:grid-cols-[5rem_1fr_1fr_1fr_1fr_4rem_auto]">
                <AdminField label="السنة" name="year" type="number" defaultValue={e.year} />
                <AdminField label="العنوان" name="titleAr" defaultValue={e.titleAr} />
                <AdminField label="Title" name="titleEn" dir="ltr" defaultValue={e.titleEn} />
                <AdminField label="المكان" name="placeAr" defaultValue={e.placeAr} />
                <AdminField label="Place" name="placeEn" dir="ltr" defaultValue={e.placeEn} />
                <AdminField label="ترتيب" name="sortOrder" type="number" defaultValue={e.sortOrder} />
                <div className="flex flex-wrap items-center gap-2">
                  <Check name="published" label="ظاهر" defaultChecked={e.published} />
                  <SubmitButton variant="ghost" name="intent" value="save">حفظ</SubmitButton>
                  <SubmitButton variant="danger" name="intent" value="delete">حذف</SubmitButton>
                </div>
              </ActionForm>
            ))}
            <ActionForm action={saveTimelineEntry.bind(null, null)} resetOnSuccess className="grid items-end gap-2 rounded-md border border-dashed border-kashi/50 bg-kashi/5 p-3 md:grid-cols-[5rem_1fr_1fr_1fr_1fr_auto]">
              <AdminField label="السنة" name="year" type="number" required />
              <AdminField label="العنوان" name="titleAr" required />
              <AdminField label="Title" name="titleEn" dir="ltr" required />
              <AdminField label="المكان" name="placeAr" />
              <AdminField label="Place" name="placeEn" dir="ltr" />
              <div className="flex items-center gap-2">
                <input type="hidden" name="published" value="on" />
                <SubmitButton>إضافة محطة</SubmitButton>
              </div>
            </ActionForm>
          </div>
        </Card>

        <Card title="معرض الصور (قسم إنستغرام في الرئيسية — أول 6 صور ظاهرة)" className="scroll-mt-6">
          <span id="gallery" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((g) => (
              <ActionForm key={g.id} action={updateGalleryImage.bind(null, g.id)} className="space-y-2 rounded-md border border-line p-2">
                <div className="relative aspect-square overflow-hidden rounded bg-dough">
                  <Image src={g.url} alt="" fill sizes="20rem" className="object-cover" />
                </div>
                <input name="altAr" defaultValue={g.altAr ?? ""} placeholder="وصف الصورة (عربي)" aria-label="وصف الصورة بالعربية" className="field !min-h-9 !py-1.5 text-sm" />
                <input name="altEn" defaultValue={g.altEn ?? ""} placeholder="Description (English)" aria-label="Description in English" dir="ltr" className="field !min-h-9 !py-1.5 text-sm" />
                <input name="link" defaultValue={g.link ?? ""} placeholder="رابط منشور إنستغرام (اختياري)" aria-label="رابط المنشور" dir="ltr" className="field !min-h-9 !py-1.5 text-sm" />
                <div className="flex flex-wrap items-center gap-2">
                  <input name="sortOrder" type="number" defaultValue={g.sortOrder} aria-label="الترتيب" className="field !min-h-9 !w-20 !py-1.5 text-sm" />
                  <Check name="published" label="ظاهرة" defaultChecked={g.published} />
                </div>
                <div className="flex gap-2">
                  <SubmitButton variant="ghost" name="intent" value="save">حفظ</SubmitButton>
                  <SubmitButton variant="danger" name="intent" value="delete">حذف</SubmitButton>
                </div>
              </ActionForm>
            ))}
          </div>
          <ActionForm action={addGalleryImage} resetOnSuccess className="mt-5 grid items-end gap-2 rounded-md border border-dashed border-kashi/50 bg-kashi/5 p-3 md:grid-cols-4">
            <input name="image" type="file" required accept="image/jpeg,image/png,image/webp,image/avif" aria-label="الصورة" className="text-sm file:me-3 file:rounded file:border-0 file:bg-white file:px-3 file:py-2" />
            <input name="altAr" placeholder="وصف الصورة (عربي)" aria-label="وصف الصورة" className="field !min-h-10 !py-2 text-sm" />
            <input name="link" placeholder="رابط المنشور (اختياري)" aria-label="رابط المنشور" dir="ltr" className="field !min-h-10 !py-2 text-sm" />
            <SubmitButton>إضافة صورة</SubmitButton>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
