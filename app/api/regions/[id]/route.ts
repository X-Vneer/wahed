import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import {
  initLocale,
  requirePermission,
  validateRequest,
  type DynamicRouteContext,
} from "@/lib/helpers"
import { updateRegionSchema } from "@/schemas/regions"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, context: DynamicRouteContext) {
  const { id } = await context.params
  const { t } = await initLocale(request)

  try {
    const permError = await requirePermission(PERMISSIONS_GROUPED.LIST.UPDATE)
    if (permError) return permError

    const body = await request.json()
    const validation = validateRequest(updateRegionSchema, body, t)
    if (validation.error) return validation.error
    const data = validation.data

    const region = await db.region.update({
      where: { id },
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
      },
    })

    return NextResponse.json(region)
  } catch (error) {
    console.error("Error updating region:", error)
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

    await db.region.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting region:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
