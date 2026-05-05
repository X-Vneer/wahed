import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { PERMISSIONS_GROUPED } from "@/config"
import {
  initLocale,
  requirePermission,
  validateRequest,
  type DynamicRouteContext,
} from "@/utils"
import { transformWebsite } from "@/prisma/websites"
import { updateWebsiteSchema } from "@/schemas/website"

export async function PUT(
  request: NextRequest,
  { params }: DynamicRouteContext<{ id: string }>
) {
  const { locale, t } = await initLocale(request)

  try {
    const permError = await requirePermission(
      PERMISSIONS_GROUPED.STAFF_PAGE.MANAGEMENT
    )
    if (permError) return permError

    const { id } = await params

    const existingWebsite = await db.website.findUnique({
      where: { id },
    })

    if (!existingWebsite) {
      return NextResponse.json(
        { error: t("websites.errors.website_not_found") },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validation = validateRequest(updateWebsiteSchema, body, t)
    if (validation.error) return validation.error
    const data = validation.data

    const website = await db.website.update({
      where: { id },
      data: {
        nameAr: data.nameAr ?? existingWebsite.nameAr,
        nameEn: data.nameEn ?? existingWebsite.nameEn,

        url: data.url ?? existingWebsite.url,
        image: data.image !== undefined ? data.image : existingWebsite.image,
        isActive:
          data.isActive !== undefined
            ? data.isActive
            : existingWebsite.isActive,
      },
    })

    return NextResponse.json(transformWebsite(website, locale))
  } catch (error) {
    console.error("Error updating website:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: DynamicRouteContext<{ id: string }>
) {
  const { t } = await initLocale(request)

  try {
    const permError = await requirePermission(
      PERMISSIONS_GROUPED.STAFF_PAGE.MANAGEMENT
    )
    if (permError) return permError

    const { id } = await params

    const existingWebsite = await db.website.findUnique({
      where: { id },
    })

    if (!existingWebsite) {
      return NextResponse.json(
        { error: t("websites.errors.website_not_found") },
        { status: 404 }
      )
    }

    await db.website.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: t("websites.success.website_deleted") },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting website:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
