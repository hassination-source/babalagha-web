# Architecture and decisions

## Overview

One Next.js application serves the public site and the admin. PostgreSQL holds all editable data. No
microservices, no separate CMS, no client-side data fetching for public pages.

```
Browser ──► Next.js (proxy.ts → App Router)
              ├─ /[locale]/*   server components → Prisma → PostgreSQL
              ├─ /admin/*      server components + server actions (auth + role checks) → Prisma
              └─ uploads       sharp re-encode → local disk or S3-compatible bucket
Leaflet (client, lazy) ──► OpenStreetMap tiles
```

## Key decisions

| Decision | Why |
|---|---|
| **Next.js 16 App Router, server-rendered on every request** (`dynamic = "force-dynamic"`) | Admin edits appear immediately; builds don't need database access; public HTML is small (60–130 KB) and fast. Put a CDN in front if traffic needs caching. |
| **Prisma 6** (not 7) | Stable, widely documented; Prisma 7 changes the client/adapter setup and was released recently. Upgrade path is straightforward. |
| **Custom session auth** instead of an auth library | Only email/password for a small staff team is needed. Random 256-bit tokens in an httpOnly, SameSite=Lax cookie; only the SHA-256 of the token is stored; 7-day expiry; bcrypt (cost 12) passwords; login rate-limited per IP (failures only); constant-time response for unknown emails. |
| **Roles: ADMIN, EDITOR, SALES** | Editors manage catalogue and content; Sales handle retailers and inquiries; Admin manages users and audit log. Checked server-side in every page, action and export route (`requireUser(permission)`), not only in the UI. |
| **Server actions + Zod** | One validation path for the browser form and the server. Public forms work as progressive enhancement. |
| **Spam protection without third-party captcha** | Honeypot field + HMAC-signed render timestamp (min 3 s, max 12 h) + Postgres-backed per-IP rate limit (5 submissions / 10 min). No tracking, works across instances. |
| **Leaflet + OpenStreetMap, lazy-loaded** | Production-appropriate, open licence, no API key. Leaflet is imported only when the map nears the viewport. Tile URL is configurable (`NEXT_PUBLIC_MAP_TILE_URL`) for a commercial provider at scale. |
| **Client-side filtering in the locator** | Hundreds to a few thousand outlets fit in one small payload; filtering is instant and works on slow connections after first load. If the list grows beyond ~5,000, move filtering to a route handler. |
| **Indexable governorate pages only for real, verified, active outlets** | Avoids thin/duplicate pages; demo data never becomes indexable. |
| **Images re-encoded with sharp** | Validates real images, strips EXIF/GPS, caps at 2400 px, converts to WebP. `next/image` serves AVIF/WebP at responsive sizes. |
| **Content blocks with built-in defaults** | The site renders correct copy even on an empty database. Admin stores only overrides; clearing a field restores the default. |
| **No cart/checkout** | Per brief. The `Product` model and `ProductVariant` table can take price/SKU fields later without restructuring. |

## Data model (prisma/schema.prisma)

- `Category` 1–n `Product` 1–n `ProductImage`, `ProductVariant` (package sizes). Optional verified fields: ingredients, allergens, storage, nutrition (JSON rows).
- `Retailer` — bilingual name/city/district/address, governorate slug, lat/lng, phone, hours, type, `status` (PENDING/ACTIVE/INACTIVE/REJECTED), `verified`, `isDemo`, private submitter fields (never selected for public pages — see `publicRetailerSelect`).
- `Inquiry`, `PartnerApplication` + `InquiryNote` (internal notes), status workflow NEW → IN_PROGRESS → RESOLVED → ARCHIVED.
- `ContentBlock` (bilingual overrides), `Setting` (contacts, social, hero image, demo switch), `TimelineEntry`, `GalleryImage`, `Media`.
- `User`, `Session`, `AuditLog` (who/what/when + field-level before/after), `RateLimit`.

## Localisation

- `/ar` default (root redirects there unless the visitor chose English — `NEXT_LOCALE` cookie).
- `<html lang dir>` set per locale; all spacing uses logical properties (`ms`, `pe`, `start`, `end`) so RTL is designed, not mirrored.
- Typography: Amiri (display, Arabic + Latin), IBM Plex Sans Arabic (body), Aref Ruqaa (slogan only). Loaded with `next/font` (self-hosted, `display: swap`).
- Each page exports its own Arabic/English title, description, canonical and hreflang alternates.

## Security checklist

- Secrets only in environment variables; nothing sensitive is passed to client components.
- Admin routes: optimistic cookie check in `proxy.ts`, real session + role check in every server component, action and route handler.
- Server actions are protected by Next's built-in origin check (CSRF).
- Security headers: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`. Add HSTS at the reverse proxy.
- CSV export neutralises formula injection; CSV import capped at 2 MB, validated row by row, transactional.
- Uploads: 8 MB limit, decoded/re-encoded, random file names, path traversal guarded.
- Errors are logged server-side without user data; users see actionable messages.
- Audit log for logins, product/category/retailer/content/settings/user changes, imports and exports.

## Performance (measured on production build, emulated mid-range phone, 1.6 Mbps / 150 ms, 4× CPU)

| Page | LCP | CLS | JS transferred |
|---|---|---|---|
| `/ar` (home) | ~0.95 s | 0 | ~146 KB (incl. React runtime) |
| `/ar/products/baklava` | ~0.4 s | 0 | cached |
| `/ar/retailers` | ~0.4 s | 0 | +48 KB Leaflet (lazy) |

## Extending

- **Cart/checkout later:** add price/SKU to `ProductVariant`, a `Cart`/`Order` model and a payment provider; product pages already have a dedicated action area.
- **Live Instagram:** add a server-side fetch of the Instagram Graph API (token in env) with caching, falling back to `GalleryImage` rows.
- **Notifications:** call a mail/SMS/WhatsApp Business API inside `src/lib/public-actions.ts` after the DB write.
