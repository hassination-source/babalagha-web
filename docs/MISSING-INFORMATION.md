# Before launch: information and assets needed from Bab Al Agha

Everything below is either missing from the official sources or was produced for this project and needs
company approval. The site works without these items; each one is shown as a clear placeholder or simply hidden.

## 1. Must have before going live

| # | Item | Where it is used | Current state |
|---|---|---|---|
| 1 | **Real retailer / outlet list** (name, governorate, city, district, address, Google Maps pin or lat/lng, phone, hours, type) | Retailer locator, homepage map, governorate pages | Only 8 demo outlets marked `[تجريبي]`. Import via Admin → منافذ البيع → استيراد CSV, then **untick "إظهار منافذ البيع التجريبية"** in Admin → المحتوى and run `SEED_DEMO_RETAILERS=false npm run db:seed` (deletes demo rows). |
| 2 | **Confirmation of contact numbers** — Management 0780 117 7770, Sales 0780 333 6665, Customer service 0783 000 3337, info@babalagha.com | Header/footer, contact, partners, structured data | Taken from babalagha.com/contact. Please confirm they are current. |
| 3 | **WhatsApp number** — which (if any) official number is on WhatsApp | Contact page WhatsApp button | Hidden until set in Admin → المحتوى. |
| 4 | **Privacy notice review** | /privacy | Plain-language draft describing what the site actually does. Needs company/legal approval. |
| 5 | **Approval of English product names and package labels** | All English product pages | Translated for this project (e.g. "Kleicha with Walnuts", "Bag of 8", "Per kilo"). Editable per product. |
| 6 | **Production domain, hosting and database** | Deployment | See DEPLOYMENT.md. |

## 2. Content that would make the site stronger

| Item | Notes |
|---|---|
| Logo in vector format (SVG/AI/EPS) and the full horizontal lockup | Only the 1948 seal PNG was available on the website. The wordmark "شركة مخابز باب الآغا / BAB AL-AGHA BAKERY.CO" seen on signage was not available as a clean file. |
| Brand guidelines / exact brand colours | Palette derived from the seal (brown `#4A1C12`, gold `#D4AC5F`) and the turquoise facade tiles (`#18858A`). Replace if official values exist. |
| Product descriptions (Arabic/English) | None on the official site, so none published. |
| Ingredients, allergens, nutrition, storage, weights, shelf life | Fields ready in the admin; nothing published until supplied. |
| Higher-resolution product photography | Current product photos are the official menu images (white background, ~1400px). |
| Additional products not on the old website | The old menu lists 36 products in 5 groups; the brief mentions a wider range. |
| Founder information / identity of the man in the seal | Not published anywhere we could verify, so not mentioned. |
| Archival photographs per timeline milestone | Timeline supports an image per entry. |
| Captions and dates for archival photos | The bakers photo is captioned only "من أرشيف باب الآغا". |
| Current production facts (facility, process, quality controls, certifications) | Quality section uses only claims supported by the official text and photos. |
| Opening hours of the Awerij location | Field ready in Admin → المحتوى. |
| Instagram post links for the gallery | Gallery uses approved photos from babalagha.com/gallery; each can link to a specific post. |

## 3. Historical copy that needs confirmation

The timeline reproduces the official About page exactly. Please confirm:

- 1948 — "المخبز الملكي أو الملوكي" — which name is preferred.
- English place renderings, e.g. "Opposite the Baghdad International Fair" for «مقابل معرض بغداد», "Mudhhir Al-Shawi Mosque".
- Whether 1995 and 1998 (both "أفران الدرويش") are two separate bakeries.
- Whether the 2019 Awerij site is a bakery/production site, a shop/café, or both (the facade photo shows a large retail venue).

## 4. Integrations not configured (by design)

| Integration | Status |
|---|---|
| Live Instagram feed | Not connected. Requires a Meta app + Instagram Graph API token for a Business/Creator account. The site uses a curated gallery and links to the official account; no scraping. |
| Analytics | None installed, so no cookie banner is required. If analytics are added, add a consent banner first. |
| Email notifications for new inquiries | Not configured (no mail provider credentials). Submissions are stored in the admin with counters. Can be added with any SMTP/transactional provider. |
| Object storage | Local disk by default; S3-compatible driver implemented but **not yet tested against a live bucket**. |
