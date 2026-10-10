import { NextResponse, type NextRequest } from "next/server";

const LOCALES = ["ar", "en"];
const PUBLIC_FILE = /\.[a-z0-9]+$/i;

/**
 * - Sends visitors without a locale prefix to /ar (Arabic is the default) or to their saved choice.
 * - Optimistically bounces unauthenticated visitors away from /admin. Real authorization happens
 *   server-side in every admin page and action (src/lib/auth.ts).
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname !== "/admin/login" && !req.cookies.get("ba_session")) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/brand") ||
    pathname.startsWith("/uploads") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const first = pathname.split("/")[1];
  if (first && LOCALES.includes(first)) {
    const h = new Headers(req.headers);
    h.set("x-pathname", pathname);
    return NextResponse.next({ request: { headers: h } });
  }

  const saved = req.cookies.get("NEXT_LOCALE")?.value;
  const locale = saved && LOCALES.includes(saved) ? saved : "ar";
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
