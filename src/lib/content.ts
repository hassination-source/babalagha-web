import "server-only";
import { cache } from "react";
import { db } from "./db";
import type { Locale } from "./i18n";
import { officialContact } from "@/data/official-catalog";

/**
 * Editable content blocks with built-in defaults. The defaults are the approved starting copy,
 * written from the official babalagha.com text; editors override them in Admin → Content.
 */
export const CONTENT_DEFAULTS = {
  "brand.slogan": {
    ar: "للماضي حكاية وطعم.. خبز باب الآغا.. حارّ ومكسّب ورخيص",
    en: "The past has a story and a taste — Bab Al Agha bread: hot, crisp and affordable.",
  },
  "home.hero.eyebrow": { ar: "شركة مخابز باب الآغا · بغداد", en: "Bab Al Agha Bakeries · Baghdad" },
  "home.hero.title": { ar: "حكاية طعم عراقي أصيل منذ عام 1948", en: "An authentic Iraqi taste, since 1948" },
  "home.hero.subtitle": {
    ar: "منذ أن طافت سلال الخبز والصمون أزقّة بغداد، ونحن نخبز الرغيف العراقي بحرفية تطوّرت عبر عشرات السنين — من خبز كل يوم إلى الحلويات والكيك والكليجة.",
    en: "Since baskets of bread and samoon first travelled the alleys of Baghdad, we have baked the Iraqi loaf with a craft refined over decades — from everyday bread to sweets, cakes and kleicha.",
  },
  "home.story.title": { ar: "قصة رغيف يختصر الزمن", en: "The story of a loaf that spans generations" },
  "home.story.body": {
    ar: "في سلالٍ حُملت على الرؤوس، خبزٌ وصمون صنعته يد الأجداد، طاف أزقّة بغداد وشوارعها. كان ذلك عام 1948. وبحرفيةٍ عالية تطوّرت صناعة الرغيف عبر عشرات السنين، حتى أصبحنا اليوم نفخر بعلامةٍ تجارية صارت عنواناً للجودة والمذاق الأصيل. إنها رحلة رغيف الخبز العراقي.",
    en: "In baskets carried on their heads, our forefathers took bread and samoon made by hand through the alleys and streets of Baghdad. That was in 1948. Over the decades, the craft of the loaf grew and matured — and today we are proud of a brand that has become a byword for quality and authentic taste. This is the journey of the Iraqi loaf.",
  },
  "home.retailers.title": { ar: "نكهة باب الآغا أقرب إليك", en: "Bab Al Agha, closer to you" },
  "home.retailers.body": {
    ar: "ابحث حسب المحافظة أو المدينة أو الحي لتجد منافذ البيع التي توفّر منتجات باب الآغا، واحصل على الاتجاهات مباشرة.",
    en: "Search by governorate, city or neighbourhood to find outlets that carry Bab Al Agha products, and get directions in one tap.",
  },
  "home.quality.title": { ar: "حِرفة تُتقَن رغيفاً بعد رغيف", en: "A craft perfected, loaf after loaf" },
  "home.quality.body": {
    ar: "من أفران الكرخ الأولى إلى مخابزنا في منطقة عويريج على طريق بغداد–الحلّة، بقي الرغيف في قلب ما نصنعه: خبز طازج كل يوم، وحلويات شرقية تُرتَّب في صوانيها بعناية، وكيك ومعجنات لكل مناسبة.",
    en: "From our first ovens in Karkh to our bakery in the Awerij area on the Baghdad–Hilla road, the loaf has stayed at the heart of what we make: fresh bread every day, oriental sweets arranged with care in their trays, and cakes and pastries for every occasion.",
  },
  "home.partners.title": { ar: "لنعمل معاً", en: "Let's work together" },
  "home.partners.body": {
    ar: "إن كنت تدير سوبرماركت أو محل مواد غذائية أو شركة توزيع أو بيع بالجملة، يسعد فريق المبيعات لدينا بالتعرّف عليك ومناقشة توفير منتجات باب الآغا لزبائنك.",
    en: "If you run a supermarket, grocery store, distribution or wholesale business, our sales team would be glad to hear from you and discuss bringing Bab Al Agha products to your customers.",
  },
  "about.closing": {
    ar: "التزامنا بسيط ويشبه رغيفنا: أن يبقى طازجاً، صادقاً، وفي متناول كل بيت عراقي.",
    en: "Our commitment is as simple as our loaf: to keep it fresh, honest and within reach of every Iraqi home.",
  },
  "footer.description": {
    ar: "مخابز عراقية بدأت حكايتها في بغداد عام 1948. خبز وصمون وحلويات وكيك ومعجنات بطعمٍ أصيل.",
    en: "An Iraqi bakery whose story began in Baghdad in 1948. Bread, samoon, sweets, cakes and pastries with an authentic taste.",
  },
} as const satisfies Record<string, { ar: string; en: string }>;

export type ContentKey = keyof typeof CONTENT_DEFAULTS;

const loadBlocks = cache(async () => {
  try {
    const rows = await db.contentBlock.findMany();
    return new Map(rows.map((r) => [r.key, r]));
  } catch (e) {
    console.error("[content] failed to load content blocks", (e as Error).message);
    return new Map();
  }
});

export async function getContent(locale: Locale) {
  const blocks = await loadBlocks();
  return (key: ContentKey): string => {
    const row = blocks.get(key);
    const v = row ? (locale === "ar" ? row.valueAr : row.valueEn) : undefined;
    return v?.trim() ? v : CONTENT_DEFAULTS[key][locale];
  };
}

/** Site settings with defaults taken from the official contact page. */
export const SETTING_DEFAULTS = {
  "contact.phone.management": officialContact.phones[0]!.number,
  "contact.phone.sales": officialContact.phones[1]!.number,
  "contact.phone.customer": officialContact.phones[2]!.number,
  "contact.email": officialContact.email,
  "contact.address.ar": officialContact.addressAr,
  "contact.address.en": officialContact.addressEn,
  /** Left empty until the company confirms which number is on WhatsApp. */
  "contact.whatsapp": "",
  "contact.hours.ar": "",
  "contact.hours.en": "",
  "social.facebook": officialContact.facebook,
  "social.instagram": officialContact.instagram,
  /** Homepage hero photograph (editable banner). */
  "home.hero.image": "/brand/categories/bread-and-samoon.webp",
  /** Show clearly-labelled demo retailers on the public locator (development only). */
  "locator.showDemo": "true",
} as const;
export type SettingKey = keyof typeof SETTING_DEFAULTS;

export const getSettings = cache(async () => {
  let rows: { key: string; value: string }[] = [];
  try {
    rows = await db.setting.findMany();
  } catch (e) {
    console.error("[settings] failed to load", (e as Error).message);
  }
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return (key: SettingKey): string => map.get(key) ?? SETTING_DEFAULTS[key];
});

export function displayPhone(e164: string): string {
  const m = /^\+964(\d{3})(\d{3})(\d{4})$/.exec(e164);
  return m ? `0${m[1]} ${m[2]} ${m[3]}` : e164;
}

export function whatsappLink(e164: string): string {
  return `https://wa.me/${e164.replace(/\D/g, "")}`;
}
