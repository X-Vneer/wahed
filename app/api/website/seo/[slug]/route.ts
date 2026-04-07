import { NextRequest, NextResponse } from "next/server"
import { PERMISSIONS } from "@/config"
import { websitePageSeoSchema } from "@/lib/schemas/website-page-seo"
import { transformZodError } from "@/lib/transform-errors"
import {
  getPageSeoForEditor,
  upsertPageSeo,
} from "@/lib/website-page-seo/service"
import { isWebsitePageSlug } from "@/lib/website-content/service"
import { hasPermission } from "@/utils/has-permission"
import { getReqLocale } from "@/utils/get-req-locale"
import { getTranslations } from "next-intl/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })

  try {
    const permissionCheck = await hasPermission(PERMISSIONS.WEBSITE_MANAGEMENT)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }
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
  { params }: { params: Promise<{ slug: string }> }
) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })

  try {
    const permissionCheck = await hasPermission(PERMISSIONS.WEBSITE_MANAGEMENT)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    const { slug } = await params
    if (!isWebsitePageSlug(slug)) {
      return NextResponse.json(
        { error: t("errors.invalid_request") },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validationResult = websitePageSeoSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: t("errors.validation_failed"),
          details: transformZodError(validationResult.error),
        },
        { status: 400 }
      )
    }

    await upsertPageSeo(slug, validationResult.data)
    return NextResponse.json({ message: t("common.saved") })
  } catch (error) {
    console.error("Error updating website page SEO:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
