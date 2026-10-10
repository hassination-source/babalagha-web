import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Lightweight, privacy-friendly spam protection (no third-party captcha):
 * 1. A hidden honeypot field ("website") that humans never fill.
 * 2. A signed render timestamp; submissions faster than MIN_SECONDS or older than MAX_HOURS are rejected.
 * Combined with the per-IP rate limit in rate-limit.ts.
 */
const MIN_SECONDS = 3;
const MAX_HOURS = 12;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be set (32+ chars)");
  return s;
}

export function formToken(now = Date.now()): string {
  const ts = String(now);
  const sig = createHmac("sha256", secret()).update(`form:${ts}`).digest("base64url");
  return `${ts}.${sig}`;
}

export type SpamVerdict = "ok" | "honeypot" | "too-fast" | "expired" | "bad-token";

export function checkSpam(form: FormData, now = Date.now()): SpamVerdict {
  const honeypot = form.get("website");
  if (typeof honeypot === "string" && honeypot.trim() !== "") return "honeypot";
  const token = form.get("_t");
  if (typeof token !== "string") return "bad-token";
  const [ts, sig] = token.split(".");
  if (!ts || !sig) return "bad-token";
  const expected = createHmac("sha256", secret()).update(`form:${ts}`).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return "bad-token";
  const age = (now - Number(ts)) / 1000;
  if (age < MIN_SECONDS) return "too-fast";
  if (age > MAX_HOURS * 3600) return "expired";
  return "ok";
}
