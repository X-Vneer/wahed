import { NextRequest, NextResponse } from "next/server"
import { PERMISSIONS } from "@/config"
import {
  initLocale,
  requirePermission,
  validateRequest,
  type DynamicRouteContext,
} from "@/lib/helpers"
import { websitePageSeoSchema } from "@/lib/schemas/website-page-seo"
import {
  getPageSeoForEditor,
  upsertPageSeo,
} from "@/lib/website-page-seo/service"
import { isWebsitePageSlug } from "@/lib/website-content/service"

export async function GET(
  request: NextRequest,
  { params }: DynamicRouteContext<{ slug: string }>
) {
  const { t } = await initLocale(request)

  try {
    const permError = await requirePermission(PERMISSIONS.WEBSITE_MANAGEMENT)
    if (permError) return permError
    const { slug } = await params
    if (!isWebsitePageSlug(slug)) {
      return NextResponse.json(
        { error: t("errors.invalid_request") },
        { status: 400 }
      )
    }

    const payload = await getPageSeoForEditor(slug)
    return NextResponse.json(payload)
  } catch (error) {
    console.error("Error fetching website page SEO:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: DynamicRouteContext<{ slug: string }>
) {
  const { t } = await initLocale(request)

  try {
    const permError = await requirePermission(PERMISSIONS.WEBSITE_MANAGEMENT)
    if (permError) return permError

    const { slug } = await params
    if (!isWebsitePageSlug(slug)) {
      return NextResponse.json(
        { error: t("errors.invalid_request") },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validation = validateRequest(websitePageSeoSchema, body, t)
    if (validation.error) return validation.error

    await upsertPageSeo(slug, validation.data)
    return NextResponse.json({ message: t("common.saved") })
  } catch (error) {
    console.error("Error updating website page SEO:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
