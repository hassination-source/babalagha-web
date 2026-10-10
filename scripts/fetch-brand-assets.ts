/**
 * Downloads Bab Al Agha's own photography from the official website's media CDN into
 * public/brand so the new site does not depend on the old Wix site.
 *
 * Usage: npm run assets:fetch
 * Images are re-encoded to WebP (max 1800px) with metadata stripped.
 */
import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { brandImages, galleryImages, officialCategories, officialProducts } from "../src/data/official-catalog";

const OUT = path.join(process.cwd(), "public", "brand");
const CDN = "https://static.wixstatic.com/media/";

async function exists(p: string) {
  try { await access(p); return true; } catch { return false; }
}

async function fetchOne(mediaId: string, dest: string, maxW = 1800) {
  if (await exists(dest)) return "skip";
  const ext = mediaId.endsWith(".png") ? "png" : "jpg";
  const url = `${CDN}${mediaId}/v1/fit/w_${maxW},h_${maxW},al_c,q_90/file.${ext}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const img = sharp(buf).rotate();
  const out = ext === "png" ? await img.png({ compressionLevel: 9 }).toBuffer() : await img.webp({ quality: 82 }).toBuffer();
  await writeFile(dest, out);
  return "ok";
}

async function main() {
  await mkdir(path.join(OUT, "products"), { recursive: true });
  await mkdir(path.join(OUT, "categories"), { recursive: true });
  await mkdir(path.join(OUT, "gallery"), { recursive: true });

  const jobs: [string, string, number?][] = [];
  jobs.push([brandImages.logo, path.join(OUT, "logo-seal.png"), 800]);
  for (const [k, id] of Object.entries(brandImages)) {
    if (k === "logo") continue;
    jobs.push([id, path.join(OUT, `${k}.webp`)]);
  }
  for (const c of officialCategories) jobs.push([c.image, path.join(OUT, "categories", `${c.slug}.webp`), 1400]);
  for (const p of officialProducts) jobs.push([p.image, path.join(OUT, "products", `${p.slug}.webp`), 1400]);
  galleryImages.forEach((id, i) => jobs.push([id, path.join(OUT, "gallery", `gallery-${String(i + 1).padStart(2, "0")}.webp`), 1200]));

  let failed = 0;
  for (const [id, dest, w] of jobs) {
    try {
      const r = await fetchOne(id, dest, w);
      console.log(r.padEnd(5), path.relative(process.cwd(), dest));
    } catch (e) {
      failed++;
      console.error("FAIL ", path.relative(process.cwd(), dest), (e as Error).message);
    }
  }
  console.log(`done, ${failed} failed`);
}

main();
