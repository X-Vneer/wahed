import createMiddleware from "next-intl/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { routing } from "./lib/i18n/routing"
import { SESSION_COOKIE_NAME } from "./config"
import { jwtVerify } from "jose"

const intlMiddleware = createMiddleware(routing)

const JWT_SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET)

async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET_KEY, {
      algorithms: ["HS256"],
    })
    return true
  } catch {
    return false
  }
}

export default async function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname

  // Check if this is the login page
  const isLoginPage = pathname.includes("/auth/login")

  // Get the access token from cookies
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value

  // If user is not authenticated and not on login page, redirect to login
  if (!isLoginPage) {
    if (!token) {
      // Extract locale from pathname or use default
      const locale = pathname.split("/")[1] || routing.defaultLocale
      const loginUrl = new URL(`/${locale}/auth/login`, request.url)
      return NextResponse.redirect(loginUrl)
    }

    // Verify token
    const isValid = await verifyToken(token)
    if (!isValid) {
      const locale = pathname.split("/")[1] || routing.defaultLocale
      const loginUrl = new URL(`/${locale}/auth/login`, request.url)
      // Clear invalid cookie
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete(SESSION_COOKIE_NAME)
      return response
    }
  }

  // If user is authenticated and on login page, redirect to home
  if (isLoginPage && token) {
    const isValid = await verifyToken(token)
    if (isValid) {
      const locale = pathname.split("/")[1] || routing.defaultLocale
      const homeUrl = new URL(`/${locale}`, request.url)
      return NextResponse.redirect(homeUrl)
    }
  }

  // Continue with next-intl middleware
  return intlMiddleware(request)
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
}
