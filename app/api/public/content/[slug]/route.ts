import { NextRequest, NextResponse } from "next/server"
import { initLocale, type DynamicRouteContext } from "@/lib/helpers"
import { websiteContentLocaleSchema } from "@/lib/schemas/website-content"
import { transformZodError } from "@/lib/transform-errors"
import {
  getPageContent,
  isWebsitePageSlug,
} from "@/lib/website-content/service"

/**
 * Public read-only endpoint for website page content.
 * No authentication. Optional `locale=ar|en` query param.
 */
export async function GET(
  request: NextRequest,
  { params }: DynamicRouteContext<{ slug: string }>
) {
  const { locale: fallbackLocale, t } = await initLocale(request)

  try {
    const { slug } = await params
    if (!isWebsitePageSlug(slug)) {
      return NextResponse.json(
        { error: t("errors.invalid_request") },
        { status: 400 }
      )
    }

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

    const content = await getPageContent(slug, localeResult.data)

    return NextResponse.json(
      { slug, locale: localeResult.data, content },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    )
  } catch (error) {
    console.error("Error fetching public website page content:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
