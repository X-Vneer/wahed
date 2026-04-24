import { initLocale } from "@/lib/helpers"
import { websiteContentLocaleSchema } from "@/lib/schemas/website-content"
import { transformZodError } from "@/lib/transform-errors"
import {
  getOrCreateWebsiteSiteSettings,
  toPublicWebsiteSettings,
  type PublicWebsiteSettingsLocale,
} from "@/lib/website-site-settings/service"
import { type NextRequest, NextResponse } from "next/server"

/**
 * Public read-only endpoint for the marketing / public website.
 * No authentication. Optional `locale=ar|en` (defaults from Accept-Language / ar).
 */
export async function GET(request: NextRequest) {
  const { locale: fallbackLocale, t } = await initLocale(request)

  try {
    const localeParam = request.nextUrl.searchParams.get("locale")
    const localeResult = websiteContentLocaleSchema.safeParse(
      localeParam ?? fallbackLocale
    )
    if (!localeResult.success) {
      return NextResponse.json(
        {
          error: t("errors.validation_failed"),
          details: transformZodError(localeResult.error),
        },
        { status: 400 }
      )
    }

    const row = await getOrCreateWebsiteSiteSettings()
    const payload = toPublicWebsiteSettings(
      row,
      localeResult.data as PublicWebsiteSettingsLocale
    )

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    })
  } catch (error) {
    console.error("Error fetching public website settings:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
