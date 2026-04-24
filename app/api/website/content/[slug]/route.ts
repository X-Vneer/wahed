import { NextRequest, NextResponse } from "next/server"
import { PERMISSIONS } from "@/config"
import {
  initLocale,
  requirePermission,
  validateRequest,
  type DynamicRouteContext,
} from "@/lib/helpers"
import { websiteContentLocaleSchema } from "@/lib/schemas/website-content"
import { transformZodError } from "@/lib/transform-errors"
import {
  type BilingualContentPatch,
  getBilingualPageContent,
  getPageContent,
  isWebsitePageSlug,
  upsertBilingualPageContent,
  upsertPageContent,
} from "@/lib/website-content/service"
import { Prisma } from "@/lib/generated/prisma/client"
import * as z from "zod/v4"

const singleLocalePayloadSchema = z.object({
  locale: websiteContentLocaleSchema,
  content: z.record(z.string(), z.unknown()),
})

const bilingualPayloadSchema = z
  .object({
    ar: z.record(z.string(), z.unknown()).optional(),
    en: z.record(z.string(), z.unknown()).optional(),
  })
  .refine((body) => body.ar !== undefined || body.en !== undefined, {
    message: "At least one locale payload is required",
  })

export async function GET(
  request: NextRequest,
  { params }: DynamicRouteContext<{ slug: string }>
) {
  const { locale, t } = await initLocale(request)

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

    const scope = request.nextUrl.searchParams.get("scope")
    if (scope === "bilingual") {
      const content = await getBilingualPageContent(slug)
      return NextResponse.json({ slug, scope: "bilingual", content })
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

    const content = await getPageContent(slug, localeResult.data)
    return NextResponse.json({ slug, locale: localeResult.data, content })
  } catch (error) {
    console.error("Error fetching website page content:", error)
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

    const scope = request.nextUrl.searchParams.get("scope")
    const body = await request.json()

    if (scope === "bilingual") {
      const validation = validateRequest(bilingualPayloadSchema, body, t)
      if (validation.error) return validation.error

      await upsertBilingualPageContent(
        slug,
        validation.data as BilingualContentPatch
      )
      return NextResponse.json({ message: t("common.saved") })
    }

    const validation = validateRequest(singleLocalePayloadSchema, body, t)
    if (validation.error) return validation.error

    await upsertPageContent(
      slug,
      validation.data.locale,
      validation.data.content as Prisma.InputJsonObject
    )

    return NextResponse.json({ message: t("common.saved") })
  } catch (error) {
    console.error("Error updating website page content:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
