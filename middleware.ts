import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const locales = ["en", "pt-br", "es"] as const;

export async function middleware(req: NextRequest) {
	const path = req.nextUrl.pathname;

	// Root -> default locale
	if (path === "/") {
		return NextResponse.redirect(new URL("/pt-br", req.url));
	}

	// Non-localized login -> localized login
	if (path === "/login") {
		return NextResponse.redirect(new URL("/pt-br/login", req.url));
	}

	const pathLocale = locales.find(
		(locale) => path === `/${locale}` || path.startsWith(`/${locale}/`)
	);

	// Not a localized page route -> allow
	if (!pathLocale) {
		return NextResponse.next();
	}

	// Public within locale: Home, Login, Register
	const isPublic =
		path === `/${pathLocale}` ||
		path.startsWith(`/${pathLocale}/login`) ||
		path.startsWith(`/${pathLocale}/register`);

	if (isPublic) {
		return NextResponse.next();
	}

	// Protected: any other localized route must have auth token
	const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
	if (!token) {
		const loginUrl = new URL(`/${pathLocale}/login`, req.url);
		loginUrl.searchParams.set("callbackUrl", path);
		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
