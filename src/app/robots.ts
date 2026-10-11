import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/i18n";

export default function robots(): MetadataRoute.Robots {
  // Staging/preview deployments (NOINDEX=true) are closed to search engines.
  if (process.env.NOINDEX === "true") return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
