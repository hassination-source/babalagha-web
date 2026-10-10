# SEO strategy (Arabic-first)

## Who searches and how

Most searches will be **Arabic, on mobile, from Iraq**, using Iraqi spellings and mixed Arabic/English
brand names. Search Console data from the existing property (verification tag preserved) should replace the
assumptions below after launch.

### Keyword groups (to validate with Search Console / Google Keyword Planner, region: Iraq)

| Intent | Arabic queries (primary) | English / transliterated | Target page |
|---|---|---|---|
| Brand | باب الآغا، مخابز باب الآغا، خبز باب الآغا، باب الاغا بغداد | bab al agha, bab alagha bakery, babalagha | Home |
| Brand + place | باب الآغا عويريج، باب الآغا طريق الحلة | bab al agha baghdad | Contact / About |
| Where to buy | وين ألگه خبز باب الآغا، منتجات باب الآغا قريب مني، باب الآغا البصرة | bab al agha near me | /retailers, /retailers/[governorate] |
| Product | صمون باب الآغا، كليجة باب الآغا، بقلاوة باب الآغا، خبز شعير، توست بالشوفان، زنود الست | kleicha, samoon, baklava baghdad | Product pages |
| Category | حلويات شرقية بغداد، كيك وترايفل، معجنات وكليجة | iraqi sweets baghdad | Category pages |
| Heritage | مخبز بغدادي قديم، أفران بغداد 1948، أفران الكرخ | old baghdad bakery | About |
| B2B | توزيع خبز بالجملة بغداد، وكيل منتجات مخابز العراق | bakery distributor iraq | /partners |

Notes on Iraqi spelling: users type both «الآغا» and «الاغا», «صمون» and «صمّون», «كليجة» and «كليچة». Product
search on the site normalises alef/hamza, taa-marbuta, yaa/alef-maqsura and tashkeel so all variants match.
Consider adding common variants naturally in descriptions when the company writes them.

## What is implemented

- Unique Arabic and English `<title>` and meta description per page; title template `… | مخابز باب الآغا`.
- Canonical URL per page + `hreflang` alternates (`ar`, `en`, `x-default` → Arabic).
- `<html lang dir>` correct per locale; `og:locale` `ar_IQ` / `en_US`.
- XML sitemap (`/sitemap.xml`) with every Arabic and English URL and hreflang alternates; `robots.txt` blocks `/admin` and `/api`.
- Structured data: `Bakery` (Organization subtype) with founding date 1948, address, phones, email, social profiles; `Product` (name, image, category, brand — **no offers, ratings or availability**); `BreadcrumbList` on products, categories, about.
- Search result pages (`?q=`) and paginated category pages are `noindex, follow`.
- Governorate retailer pages (`/ar/retailers/basra`) exist **only** when that governorate has at least one real, verified, active outlet — no thin pages.
- Old Wix URLs (`/menu`, `/about`, `/contact`, `/gallery`) 301 to the new pages.
- Descriptive bilingual `alt` text on product images (editable per image), Open Graph images per product/category.
- Fast mobile pages (LCP < 1 s on emulated mid-range phone), no layout shift, map and gallery lazy-loaded.

## After launch

1. Submit the sitemap in Search Console; check the "International targeting" and coverage reports.
2. Create/claim the **Google Business Profile** for the Awerij location with the same name, address and phone as the site (NAP consistency matters more than anything on-page for "near me" queries).
3. Ask major retail partners to list "منتجات باب الآغا متوفرة" on their own profiles and link to the locator.
4. As real product descriptions arrive, write them in natural Iraqi Arabic (100–200 words), mentioning use occasions (فطور، عزايم، رمضان، العيد).
5. Review queries monthly; add FAQ content only for questions people actually ask.
