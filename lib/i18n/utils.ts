import { type NextRequest } from "next/server"
import { LOCALES } from "@/config"
import { routing } from "./routing"

/**
 * Extracts the locale from a NextRequest in API routes.
 * Checks in order:
 * 1. X-Locale header (set by axios interceptor)
 * 2. Query parameter `locale`
 * 3. Referer header (extracts from URL path like /en/... or /ar/...)
 * 4. Accept-Language header
 * 5. Default locale
 */
export function getLocaleFromRequest(request: NextRequest): string {
  // 1. Check X-Locale header (set by axios interceptor)
  const localeHeader = request.headers.get("x-locale")
  if (localeHeader && LOCALES.includes(localeHeader)) {
    return localeHeader
  }

  // 2. Check query parameter
  const localeParam = request.nextUrl.searchParams.get("locale")
  if (localeParam && LOCALES.includes(localeParam)) {
    return localeParam
  }

  // 3. Check Referer header for locale in path
  const referer = request.headers.get("referer")
  if (referer) {
    try {
      const refererUrl = new URL(referer)
      const pathSegments = refererUrl.pathname.split("/").filter(Boolean)
      if (pathSegments.length > 0) {
        const potentialLocale = pathSegments[0]
        if (LOCALES.includes(potentialLocale)) {
          return potentialLocale
        }
      }
    } catch {
      // Invalid referer URL, continue
    }
  }

  // 4. Check Accept-Language header
  const acceptLanguage = request.headers.get("accept-language")
  if (acceptLanguage) {
    // Parse Accept-Language header (e.g., "en-US,en;q=0.9,ar;q=0.8")
    const languages = acceptLanguage
      .split(",")
      .map((lang) => lang.split(";")[0].trim().toLowerCase().split("-")[0])

    for (const lang of languages) {
      if (LOCALES.includes(lang)) {
        return lang
      }
    }
  }

  // 5. Fall back to default locale
  return routing.defaultLocale
}
