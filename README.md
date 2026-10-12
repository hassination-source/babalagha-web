# Bab Al Agha — official website and admin

Bilingual (Arabic-first, English) brand site, product catalogue, retailer locator and admin dashboard for
**شركة مخابز باب الآغا / Bab Al Agha Bakeries** (Baghdad, since 1948).

| | |
|---|---|
| Stack | Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS 4 · PostgreSQL · Prisma 6 · Zod 4 · Leaflet + OpenStreetMap |
| Public site | `/ar` (default) and `/en` — home, products, categories, product detail, our story, retailer locator, partner form, contact, privacy |
| Admin | `/admin` — products, categories, retailers (map, CSV import/export, approvals, history), inquiries, partner applications, content & settings, users/roles, audit log |
| Tests | 26 unit tests (Vitest) · 21 end-to-end tests (Playwright) covering forms, locator, search, auth, product & retailer CRUD, CSV import |

## Quick start (local)

Requirements: Node.js 20.9+ (22 recommended) and PostgreSQL 14+.

```bash
cp .env.example .env            # set DATABASE_URL, DIRECT_URL, SESSION_SECRET (openssl rand -base64 48), SITE_URL
npm install
npx prisma migrate deploy       # create tables
npm run db:seed                 # official catalogue + timeline + gallery + clearly-labelled demo retailers
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-long-passphrase' ADMIN_NAME='Your Name' npm run admin:create
npm run dev                     # http://localhost:3000  →  /ar
```

Sign in at `http://localhost:3000/admin`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` / `build` / `start` | Develop, build (runs `prisma generate`), serve production build |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm test` | Unit tests (validation, CSV, spam protection, search, coordinates, data integrity) |
| `npm run test:e2e` | Playwright against a running app. Set `E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD` to include admin tests. Install browsers once with `npx playwright install chromium`. |
| `npm run db:migrate` | Apply migrations (production) |
| `npm run db:seed` | Seed / re-seed (idempotent; never overwrites products edited in the admin) |
| `npm run admin:create` | Create or reset an admin (`ADMIN_ROLE=ADMIN|EDITOR|SALES`) |
| `npm run assets:fetch` | Re-download Bab Al Agha's photography from the old site's media CDN into `public/brand` |

## Project layout

```
prisma/              schema.prisma, migrations/, seed.ts
scripts/             create-admin.ts, fetch-brand-assets.ts
public/brand/        Bab Al Agha's own photography and logo (from babalagha.com), optimised to WebP
src/
  app/[locale]/      public pages (ar, en)
  app/admin/         login + dashboard (route group (panel) is auth-protected)
  app/sitemap.ts     bilingual sitemap with hreflang
  components/site    public UI       components/admin  admin UI       components/map  Leaflet locator
  components/forms   public forms (server actions)
  data/official-catalog.ts   audited source data from babalagha.com
  lib/               auth, db, validation, csv, storage, spam, rate-limit, content, seo, i18n, actions/*
  proxy.ts           locale redirect + optimistic admin gate (Next 16 "proxy", formerly middleware)
tests/               unit.test.ts, e2e/*.spec.ts
docs/                architecture, deployment, admin guide (Arabic), SEO, missing information, CSV template
```

## Documentation

- [docs/MISSING-INFORMATION.md](docs/MISSING-INFORMATION.md) — **read before launch**: what the company must supply or approve
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — decisions, data model, security model
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — GitHub → Vercel + Supabase step by step; Docker/VPS alternative; backups
- [docs/ADMIN-GUIDE.md](docs/ADMIN-GUIDE.md) — دليل لوحة التحكم بالعربية
- [docs/SEO.md](docs/SEO.md) — Arabic-first keyword strategy and technical SEO
- [docs/retailers-import-template.csv](docs/retailers-import-template.csv) — retailer import template

## Data honesty rules built into the project

- Product names, package text, categories, timeline, address, phones and email come from the official site (audited 11 Oct 2026). English product names are translations awaiting approval.
- No ingredients, nutrition, allergens, weights, shelf life, prices, ratings, certifications or statistics were invented. Those fields exist and render only when an editor fills them in.
- Every seeded retailer is fake, named `[تجريبي] …` / `[Demo] …`, flagged `isDemo`, shown with a "demo data" banner, excluded from indexable governorate pages, and can be hidden with one switch in Admin → Content.
- Forms report success only after the database write commits.
