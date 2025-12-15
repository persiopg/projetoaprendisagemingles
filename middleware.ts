import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const locales = ["en", "pt-br", "es"];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Debug logs
  console.log(`[Middleware] Processing path: ${path}`);

  // 1. Root path -> Redirect to default locale
  if (path === "/") {
    return NextResponse.redirect(new URL("/pt-br", req.url));
  }

  // 2. /login -> Redirect to default locale login
  if (path === "/login") {
    return NextResponse.redirect(new URL("/pt-br/login", req.url));
  }

  // 3. Check if it's a locale path
  const pathLocale = locales.find(locale => 
    path === `/${locale}` || path.startsWith(`/${locale}/`)
  );

  if (!pathLocale) {
    // console.log(`[Middleware] No locale found for ${path}, allowing.`);
    return NextResponse.next();
  }

  // 4. Define public paths within locale
  const isPublic = 
    path === `/${pathLocale}` || 
    path.startsWith(`/${pathLocale}/login`) || 
    path.startsWith(`/${pathLocale}/register`);

  // console.log(`[Middleware] Locale: ${pathLocale}, IsPublic: ${isPublic}`);

  if (isPublic) {
    return NextResponse.next();
  }

  // 5. Protected path: Check for token
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  console.log(`[Middleware] Path: ${path}, Token: ${!!token ? "YES" : "NO"}`);

  if (!token) {
    console.log(`[Middleware] Access denied. Redirecting to login.`);
    const loginUrl = new URL(`/${pathLocale}/login`, req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
