import "server-only";
import { randomUUID, createHash, createHmac } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp, { type Metadata as SharpMetadata } from "sharp";

/**
 * Upload storage.
 * - STORAGE_DRIVER=local (default): files are written to public/uploads and served by Next.js.
 *   Suitable for a single server with a persistent disk.
 * - STORAGE_DRIVER=s3: any S3-compatible bucket (AWS S3, Cloudflare R2, DigitalOcean Spaces, MinIO).
 *   Requires S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_PUBLIC_URL.
 *   Uses AWS Signature V4 without the AWS SDK.
 *
 * Every image is decoded and re-encoded with sharp. That validates it is a real image,
 * strips EXIF/GPS metadata and caps dimensions.
 */

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["jpeg", "png", "webp", "avif", "heif"]);
const MAX_DIM = 2400;

export type StoredImage = { url: string; key: string; mime: string; width: number; height: number; size: number };

export class UploadError extends Error {}

export async function processImage(file: File): Promise<{ buffer: Buffer; width: number; height: number }> {
  if (file.size === 0) throw new UploadError("empty");
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError("too-large");
  const input = Buffer.from(await file.arrayBuffer());
  let meta: SharpMetadata;
  try {
    meta = await sharp(input).metadata();
  } catch {
    throw new UploadError("not-an-image");
  }
  if (!meta.format || !ALLOWED.has(meta.format)) throw new UploadError("unsupported-format");
  const out = await sharp(input)
    .rotate()
    .resize({ width: MAX_DIM, height: MAX_DIM, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 84 })
    .toBuffer({ resolveWithObject: true });
  return { buffer: out.data, width: out.info.width, height: out.info.height };
}

export async function storeImage(file: File, folder: string): Promise<StoredImage> {
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "");
  const { buffer, width, height } = await processImage(file);
  const key = `${safeFolder}/${new Date().toISOString().slice(0, 7)}/${randomUUID()}.webp`;
  const driver = process.env.STORAGE_DRIVER ?? "local";
  const url = driver === "s3" ? await putS3(key, buffer, "image/webp") : await putLocal(key, buffer);
  return { url, key, mime: "image/webp", width, height, size: buffer.length };
}

async function putLocal(key: string, body: Buffer): Promise<string> {
  const dest = path.join(process.cwd(), "public", "uploads", key);
  if (!dest.startsWith(path.join(process.cwd(), "public", "uploads"))) throw new UploadError("bad-path");
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, body);
  return `/uploads/${key}`;
}

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new UploadError(`missing-${name}`);
  return v;
}

const sha256hex = (b: Buffer | string) => createHash("sha256").update(b).digest("hex");
const hmac = (k: Buffer | string, v: string) => createHmac("sha256", k).update(v).digest();

async function putS3(key: string, body: Buffer, contentType: string): Promise<string> {
  const endpoint = new URL(env("S3_ENDPOINT"));
  const region = env("S3_REGION");
  const bucket = env("S3_BUCKET");
  const accessKey = env("S3_ACCESS_KEY_ID");
  const secretKey = env("S3_SECRET_ACCESS_KEY");
  const publicUrl = env("S3_PUBLIC_URL").replace(/\/$/, "");

  const host = endpoint.host;
  const canonicalUri = `/${bucket}/${key.split("/").map(encodeURIComponent).join("/")}`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = sha256hex(body);
  const headers: Record<string, string> = {
    host,
    "content-type": contentType,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
    "cache-control": "public, max-age=31536000, immutable",
  };
  const signedHeaders = Object.keys(headers).sort().join(";");
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map((h) => `${h}:${headers[h]}\n`)
    .join("");
  const canonicalRequest = ["PUT", canonicalUri, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const scope = `${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256hex(canonicalRequest)].join("\n");
  const kSigning = hmac(hmac(hmac(hmac(`AWS4${secretKey}`, dateStamp), region), "s3"), "aws4_request");
  const signature = createHmac("sha256", kSigning).update(stringToSign).digest("hex");
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(`${endpoint.origin}${canonicalUri}`, {
    method: "PUT",
    headers: { ...headers, authorization },
    body: new Uint8Array(body),
  });
  if (!res.ok) {
    console.error("[storage] S3 upload failed", res.status);
    throw new UploadError("storage-failed");
  }
  return `${publicUrl}/${key}`;
}
