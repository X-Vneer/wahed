import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import { updateCitySchema } from "@/lib/schemas/cities"
import { transformZodError } from "@/lib/transform-errors"
import { getReqLocale } from "@/utils/get-req-locale"
import { hasPermission } from "@/utils/has-permission"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const locale = await getReqLocale(request)
  const t = await getTranslations(locale)

  try {
    const permissionCheck = await hasPermission(PERMISSIONS_GROUPED.LIST.UPDATE)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    const body = await request.json()
    const validationResult = updateCitySchema.safeParse(body)

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

    const city = await db.city.update({
      where: { id },
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        regionId: data.regionId,
      },
    })

    return NextResponse.json(city)
  } catch (error) {
    console.error("Error updating city:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const locale = await getReqLocale(request)
  const t = await getTranslations(locale)

  try {
    const permissionCheck = await hasPermission(PERMISSIONS_GROUPED.LIST.DELETE)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    await db.city.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting city:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
