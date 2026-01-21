import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { getReqLocale } from "@/utils/get-req-locale"
import { getTranslations } from "next-intl/server"
import { hasPermission } from "@/utils/has-permission"
import { PERMISSIONS_GROUPED } from "@/config"
import { transformWebsite } from "@/prisma/websites"
import { updateWebsiteSchema } from "@/lib/schemas/website"
import { transformZodError } from "@/lib/transform-errors"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })

  try {
    const permissionCheck = await hasPermission(
      PERMISSIONS_GROUPED.STAFF_PAGE.MANAGEMENT
    )
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

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
    const validationResult = updateWebsiteSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: transformZodError(validationResult.error),
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

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
  { params }: { params: Promise<{ id: string }> }
) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })

  try {
    const permissionCheck = await hasPermission(
      PERMISSIONS_GROUPED.STAFF_PAGE.MANAGEMENT
    )
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

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
