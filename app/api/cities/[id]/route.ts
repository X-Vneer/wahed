import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import {
  initLocale,
  requirePermission,
  validateRequest,
  type DynamicRouteContext,
} from "@/lib/helpers"
import { updateCitySchema } from "@/lib/schemas/cities"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(
  request: NextRequest,
  context: DynamicRouteContext
) {
  const { id } = await context.params
  const { t } = await initLocale(request)

  try {
    const permError = await requirePermission(PERMISSIONS_GROUPED.LIST.UPDATE)
    if (permError) return permError

    const body = await request.json()
    const validation = validateRequest(updateCitySchema, body, t)
    if (validation.error) return validation.error
    const data = validation.data

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

export async function DELETE(
  request: NextRequest,
  context: DynamicRouteContext
) {
  const { id } = await context.params
  const { t } = await initLocale(request)

  try {
    const permError = await requirePermission(PERMISSIONS_GROUPED.LIST.DELETE)
    if (permError) return permError

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
