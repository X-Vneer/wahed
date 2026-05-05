import { NextRequest, NextResponse } from "next/server"
import { initLocale, type DynamicRouteContext } from "@/lib/helpers"
import { websiteContentLocaleSchema } from "@/schemas/website-content"
import { transformZodError } from "@/utils/transform-errors"
import { isWebsitePageSlug } from "@/lib/website-content/service"
import { getPageSeoWithFallback } from "@/lib/website-page-seo/service"

export async function GET(
  request: NextRequest,
  { params }: DynamicRouteContext<{ slug: string }>
) {
  const { locale, t } = await initLocale(request)

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
      localeParam ?? locale
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

    const seo = await getPageSeoWithFallback(slug, localeResult.data)
    return NextResponse.json({ slug, locale: localeResult.data, seo })
  } catch (error) {
    console.error("Error fetching public website page SEO:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
