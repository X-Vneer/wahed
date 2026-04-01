import { NextRequest, NextResponse } from "next/server"
import { PERMISSIONS } from "@/config"
import { websiteContentLocaleSchema } from "@/lib/schemas/website-content"
import { transformZodError } from "@/lib/transform-errors"
import {
  getBilingualPageContent,
  getPageContent,
  isWebsitePageSlug,
  upsertBilingualPageContent,
  upsertPageContent,
} from "@/lib/website-content/service"
import { Prisma } from "@/lib/generated/prisma/client"
import { hasPermission } from "@/utils/has-permission"
import { getReqLocale } from "@/utils/get-req-locale"
import { getTranslations } from "next-intl/server"
import * as z from "zod/v4"

const singleLocalePayloadSchema = z.object({
  locale: websiteContentLocaleSchema,
  content: z.record(z.string(), z.unknown()),
})

const bilingualPayloadSchema = z.object({
  ar: z.record(z.string(), z.unknown()),
  en: z.record(z.string(), z.unknown()),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })

  try {
    const { slug } = await params
    console.log("🚀 ~ GET ~ slug:", slug)
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

    const scope = request.nextUrl.searchParams.get("scope")
    const body = await request.json()

    if (scope === "bilingual") {
      const validationResult = bilingualPayloadSchema.safeParse(body)
      if (!validationResult.success) {
        return NextResponse.json(
          {
            error: t("errors.validation_failed"),
            details: transformZodError(validationResult.error),
          },
          { status: 400 }
        )
      }

      await upsertBilingualPageContent(slug, {
        ar: validationResult.data.ar as Prisma.InputJsonObject,
        en: validationResult.data.en as Prisma.InputJsonObject,
      })
      return NextResponse.json({ message: t("common.saved") })
    }

    const validationResult = singleLocalePayloadSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: t("errors.validation_failed"),
          details: transformZodError(validationResult.error),
        },
        { status: 400 }
      )
    }

    await upsertPageContent(
      slug,
      validationResult.data.locale,
      validationResult.data.content as Prisma.InputJsonObject
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
