# Deployment

## Recommended: GitHub → Vercel + Supabase

### 1. GitHub
Create an empty **private** repository (e.g. `babalagha-web`), then from the unzipped project:
```bash
git init && git add -A && git commit -m "Initial import"
git branch -M main
git remote add origin https://github.com/<you>/babalagha-web.git
git push -u origin main
```

### 2. Supabase (database + image storage)
1. New project, region **Frankfurt (eu-central-1)** (closest to Iraq that Vercel also has: `fra1`).
2. **Database → Connect → ORMs → Prisma** gives two strings:
   - `DATABASE_URL` = Transaction pooler (port 6543) **with `?pgbouncer=true&connection_limit=1`**
   - `DIRECT_URL` = Session pooler / direct (port 5432) — used only by migrations
3. **Storage → New bucket** `media`, **Public**.
4. **Storage → S3 Connection → New access key** → note Access key ID, Secret, Endpoint, Region.

### 3. Vercel
Import the GitHub repo (framework Next.js is detected; `vercel.json` sets the build command to
`prisma migrate deploy && next build` and region `fra1`). Add environment variables:

| Name | Value |
|---|---|
| `DATABASE_URL` | Supabase transaction pooler URL (+ `?pgbouncer=true&connection_limit=1`) |
| `DIRECT_URL` | Supabase session/direct URL |
| `SESSION_SECRET` | `openssl rand -base64 48` |
| `SITE_URL` | `https://<project>.vercel.app` now, `https://www.babalagha.com` at launch |
| `NOINDEX` | `true` until the site replaces babalagha.com (blocks search engines) |
| `STORAGE_DRIVER` | `s3` |
| `S3_ENDPOINT` | `https://<ref>.supabase.co/storage/v1/s3` |
| `S3_REGION` | `eu-central-1` (your project region) |
| `S3_BUCKET` | `media` |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | from step 2.4 |
| `S3_PUBLIC_URL` | `https://<ref>.supabase.co/storage/v1/object/public/media` |

Deploy. The first build creates all tables.

### 4. Seed and first admin (once, from your computer)
```bash
npm install
DATABASE_URL="<DIRECT_URL value>" DIRECT_URL="<DIRECT_URL value>" npm run db:seed
DATABASE_URL="<DIRECT_URL value>" DIRECT_URL="<DIRECT_URL value>" \
  ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='long passphrase' ADMIN_NAME='Hassan' npm run admin:create
```
Then sign in at `https://<project>.vercel.app/admin` and upload one product image to confirm storage works.

### Notes
- Vercel **Hobby** is for non-commercial use; a client's production site needs **Pro**.
- Changing `NEXT_PUBLIC_*` or `S3_PUBLIC_URL` requires a redeploy (they are read at build time).
- At launch: remove `NOINDEX`, set `SITE_URL`, add the domain in Vercel, untick demo retailers in Admin → المحتوى.

---

## Alternative hosting

The app needs: Node.js 20.9+ (22 LTS recommended), PostgreSQL 14+, persistent storage for uploads (disk or
S3-compatible bucket), HTTPS.

## Option A — Single VPS with Docker Compose (simplest)

> The Dockerfile and compose file are provided but were not run in the build environment (Docker was not available there). The same steps were verified with `npm run build && npm start`.

```bash
git clone <repo> babalagha && cd babalagha
cat > .env <<'EOF'
POSTGRES_PASSWORD=<strong password>
SESSION_SECRET=<openssl rand -base64 48>
SITE_URL=https://www.babalagha.com
EOF
docker compose up -d --build          # runs migrations on start
```

Seed the catalogue and create the first admin from a checkout of the repo on any machine that can reach the
database (e.g. via an SSH tunnel to port 5432, or temporarily exposing the db service):

```bash
export DATABASE_URL=postgresql://babalagha:<password>@<host>:5432/babalagha
npm ci && npm run db:seed
ADMIN_EMAIL=... ADMIN_PASSWORD='...' ADMIN_NAME='...' npm run admin:create
```

Put Nginx/Caddy in front for TLS (Caddy: `www.babalagha.com { reverse_proxy 127.0.0.1:3000 }`). Add HSTS.

## Option B — Node directly (PM2/systemd)

```bash
npm ci
npx prisma migrate deploy
npm run db:seed                      # first time only
npm run build
cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/
node .next/standalone/server.js      # or: npm start
```

Keep `public/uploads` on a persistent path (symlink it) if using the local storage driver.

## Option C — Managed hosting (Vercel / Render / Railway / Fly) + managed Postgres

- Set `DATABASE_URL`, `SESSION_SECRET`, `SITE_URL`.
- Serverless platforms have no persistent disk: set `STORAGE_DRIVER=s3` with an S3-compatible bucket (Cloudflare R2 recommended — no egress fees) and `S3_PUBLIC_URL`.
- Run `npx prisma migrate deploy` as a release/pre-deploy command.

## Storage (S3-compatible)

```
STORAGE_DRIVER=s3
S3_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET=babalagha-media
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_PUBLIC_URL=https://media.babalagha.com
```

Grant the key `PutObject` only. Make the bucket publicly readable through `S3_PUBLIC_URL`.
⚠️ The S3 driver signs requests with AWS SigV4 (no SDK) and is **not yet tested against a live bucket** — upload one image in the admin after configuring it.

## Map tiles

Default tiles come from `tile.openstreetmap.org`, which is fine for modest traffic under the
[OSM tile usage policy](https://operations.osmfoundation.org/policies/tiles/). For heavy traffic set
`NEXT_PUBLIC_MAP_TILE_URL` to a commercial provider (MapTiler, Stadia, Mapbox raster) and rebuild.

## Domain cut-over from Wix

1. Deploy and test on a staging subdomain.
2. Import the real retailer list; untick demo retailers; run `SEED_DEMO_RETAILERS=false npm run db:seed`.
3. Point `www.babalagha.com` DNS to the new server; redirect the apex domain to `www`.
4. Old Wix URLs are permanently redirected in `next.config.ts`: `/menu` → `/ar/products`, `/about` → `/ar/about`, `/contact` → `/ar/contact`, `/gallery` → `/ar`.
5. Submit `https://www.babalagha.com/sitemap.xml` in Google Search Console (the existing verification meta tag from the Wix site is already included, so the current Search Console property keeps working).

## Backups

- PostgreSQL: daily `pg_dump` (or the managed provider's point-in-time recovery). Keep 14+ days.
- Uploads: back up the `uploads` volume or enable bucket versioning.

## Monitoring

Errors are logged to stdout with a `[area]` prefix and without personal data. Ship logs to your provider and
alert on `[contact] submission failed` / `[partner] submission failed`.
