import { jwtVerify } from "jose"
import createMiddleware from "next-intl/middleware"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { SESSION_COOKIE_NAME } from "./config"
import { routing } from "./lib/i18n/routing"

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

const ALLOWED_ORIGINS = [
  process.env.PUBLIC_WEBSITE_URL,
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean) as string[]

function getCorsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept-Language",
    "Access-Control-Max-Age": "86400",
  }

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin
  } else if (ALLOWED_ORIGINS.length === 0) {
    headers["Access-Control-Allow-Origin"] = "*"
  }

  return headers
}

function withCorsHeaders(response: NextResponse, origin: string | null) {
  const corsHeaders = getCorsHeaders(origin)
  for (const [key, value] of Object.entries(corsHeaders)) {
    response.headers.set(key, value)
  }
  return response
}

export default async function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname
  console.log("🚀 ~ middleware ~ pathname:", pathname)

  // Check if this is an API route
  const isApiRoute = pathname.startsWith("/api")

  // Check if this is the login page
  const publicPages = ["/auth/login", "/auth/logout"]
  const isPublicPage = publicPages.some((page) => pathname.includes(page))

  // Public API routes that don't require authentication
  const publicApiRoutes = [
    "/api/auth/logout",
    "/api/auth/login",
    "/api/health",
    "/api/uploadthing",
  ]
  const publicApiPrefixes = ["/api/public"]
  const isPublicApiRoute =
    publicApiRoutes.some((route) => pathname.includes(route)) ||
    publicApiPrefixes.some((prefix) => pathname.startsWith(prefix))

  // Check if this is a public API route that needs CORS
  const isPublicCorsRoute = publicApiPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  )
  const origin = request.headers.get("origin")

  // Get the access token from cookies
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value

  // Handle API routes
  if (isApiRoute) {
    // Allow public API routes to pass through (with CORS if needed)
    if (isPublicApiRoute) {
      // Handle preflight OPTIONS request
      if (isPublicCorsRoute && request.method === "OPTIONS") {
        return new NextResponse(null, {
          status: 204,
          headers: getCorsHeaders(origin),
        })
      }

      const response = NextResponse.next()
      if (isPublicCorsRoute) {
        return withCorsHeaders(response, origin)
      }
      return response
    }

    // For protected API routes, verify authentication
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify token
    const isValid = await verifyToken(token)
    if (!isValid) {
      // Clear invalid cookie
      const response = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
      response.cookies.delete(SESSION_COOKIE_NAME)
      return response
    }

    // Token is valid, allow request to proceed
    return NextResponse.next()
  }

  // Handle page routes (existing logic)
  // If user is not authenticated and not on login page, redirect to login
  if (!isPublicPage) {
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

  // If user is authenticated and on login page (not logout), redirect to home
  const isLoginPage = pathname.includes("/auth/login")
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
  // - … if they start with `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  // Note: API routes are now included for authentication
  matcher: "/((?!trpc|_next|_vercel|.*\\..*).*)",
}
