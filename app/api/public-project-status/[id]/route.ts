import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import {
  initLocale,
  requirePermission,
  validateRequest,
  type DynamicRouteContext,
} from "@/utils"
import { updatePublicProjectStatusSchema } from "@/schemas/public-project-status"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, context: DynamicRouteContext) {
  const { t } = await initLocale(request)
  try {
    const { id } = await context.params

    const row = await db.publicProjectStatus.findUnique({ where: { id } })

    if (!row) {
      return NextResponse.json(
        { error: t("publicProjectStatus.errors.not_found") },
        { status: 404 }
      )
    }

    return NextResponse.json(row)
  } catch (error) {
    console.error("Error fetching public project status:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: DynamicRouteContext) {
  const { t } = await initLocale(request)
  try {
    const { id } = await context.params

    const permError = await requirePermission(PERMISSIONS_GROUPED.LIST.UPDATE)
    if (permError) return permError

    const body = await request.json()
    const validation = validateRequest(updatePublicProjectStatusSchema, body, t)
    if (validation.error) return validation.error

    const existing = await db.publicProjectStatus.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json(
        { error: t("publicProjectStatus.errors.not_found") },
        { status: 404 }
      )
    }

    const data = validation.data

    const updated = await db.publicProjectStatus.update({
      where: { id },
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        color: data.color,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating public project status:", error)

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
  const { t } = await initLocale(request)
  try {
    const { id } = await context.params

    const permError = await requirePermission(PERMISSIONS_GROUPED.LIST.DELETE)
    if (permError) return permError

    const existing = await db.publicProjectStatus.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json(
        { error: t("publicProjectStatus.errors.not_found") },
        { status: 404 }
      )
    }

    if (existing.isSystem) {
      return NextResponse.json(
        { error: t("publicProjectStatus.errors.cannot_delete_system") },
        { status: 403 }
      )
    }

    await db.publicProjectStatus.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting public project status:", error)

    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
