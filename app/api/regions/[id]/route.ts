import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import { updateRegionSchema } from "@/lib/schemas/regions"
import { transformZodError } from "@/lib/transform-errors"
import { hasPermission } from "@/utils/has-permission"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

type RouteContext = {
  params: {
    id: string
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const t = await getTranslations()

  try {
    const permissionCheck = await hasPermission(PERMISSIONS_GROUPED.LIST.UPDATE)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    const body = await request.json()
    const validationResult = updateRegionSchema.safeParse(body)

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

    const region = await db.region.update({
      where: { id: context.params.id },
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

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const t = await getTranslations()

  try {
    const permissionCheck = await hasPermission(PERMISSIONS_GROUPED.LIST.DELETE)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    await db.region.delete({
      where: { id: context.params.id },
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
