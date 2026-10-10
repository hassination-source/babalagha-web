import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";
import { getSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, PageHero } from "@/components/site/bits";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return pageMetadata({ locale, path: "/privacy", title: t.privacy.title, description: locale === "ar" ? "كيف تتعامل مخابز باب الآغا مع البيانات التي ترسلها عبر الموقع." : "How Bab Al Agha Bakeries handles the information you send through this website." });
}

/**
 * Plain-language privacy notice describing what the site actually does.
 * IMPORTANT: this text must be reviewed by the company (and its legal adviser) before launch.
 * The site sets one strictly-necessary cookie for admin sign-in and one for the language preference,
 * and loads no analytics or advertising trackers, so no cookie-consent banner is required as built.
 * If analytics are added later, add a consent banner before loading them.
 */
export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const s = await getSettings();
  const email = s("contact.email");
  const ar = locale === "ar";

  const sections = ar
    ? [
        ["ما الذي نجمعه", "نجمع فقط ما ترسله إلينا بنفسك عبر نماذج الموقع: الاسم ورقم الهاتف والبريد الإلكتروني (اختياري) ونص رسالتك، وفي نموذج الشراكة أو إضافة متجر: اسم النشاط وموقعه ونوعه."],
        ["لماذا نجمعه", "نستخدم هذه البيانات للرد على استفسارك، ومراجعة طلبات الشراكة، والتحقق من منافذ البيع قبل نشرها على الخريطة. لا نبيع بياناتك ولا نشاركها لأغراض إعلانية."],
        ["ما الذي يُنشر", "عند اعتماد منفذ بيع، ننشر اسمه وعنوانه وهاتف المتجر فقط. أما اسم ورقم الشخص الذي أرسل الطلب فلا يُنشران أبداً."],
        ["ملفات تعريف الارتباط", "يستخدم الموقع ملف ارتباط واحداً لحفظ اللغة التي تختارها، وملفاً آخر لتسجيل دخول فريق الإدارة فقط. لا نستخدم أدوات تتبّع أو إعلانات. تُحمَّل الخرائط من خدمة OpenStreetMap عند فتح صفحة منافذ البيع."],
        ["مدة الاحتفاظ", "نحتفظ بالرسائل والطلبات طالما احتجنا إليها لمتابعتها، ثم تُؤرشف أو تُحذف."],
        ["حقوقك", `يمكنك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها بمراسلتنا على ${email}.`],
      ]
    : [
        ["What we collect", "Only what you send us through the website's forms: your name, phone number, email (optional) and message; and for partnership or store requests, the business name, type and location."],
        ["Why we collect it", "To reply to your enquiry, review partnership requests, and verify retail outlets before they appear on the map. We do not sell your data or share it for advertising."],
        ["What gets published", "When an outlet is approved we publish only its name, address and store phone. The name and number of the person who submitted it are never published."],
        ["Cookies", "The site uses one cookie to remember your language and another only for admin team sign-in. We use no tracking or advertising tools. Map tiles are loaded from OpenStreetMap when you open the retailer page."],
        ["How long we keep it", "We keep messages and requests while we need them for follow-up, then archive or delete them."],
        ["Your rights", `You can ask to see, correct or delete your data by emailing ${email}.`],
      ];

  return (
    <>
      <PageHero title={t.privacy.title}>
        <Breadcrumbs label={ar ? "مسار التنقل" : "Breadcrumb"} items={[{ name: t.common.home, href: `/${locale}` }, { name: t.privacy.title }]} />
      </PageHero>
      <div className="container-page max-w-3xl py-12 md:py-16">
        {sections.map(([h, p]) => (
          <section key={h} className="mb-9">
            <h2 className="t-h3 text-seal">{h}</h2>
            <p className="mt-2 text-lg leading-[1.9]">{p}</p>
          </section>
        ))}
      </div>
    </>
  );
}
