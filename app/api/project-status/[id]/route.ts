import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import {
  initLocale,
  requirePermission,
  validateRequest,
  type DynamicRouteContext,
} from "@/lib/helpers"
import { updateProjectStatusSchema } from "@/lib/schemas/project-status"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  context: DynamicRouteContext
) {
  const { t } = await initLocale(request)
  try {
    const { id } = await context.params

    const projectStatus = await db.projectStatus.findUnique({
      where: { id },
    })

    if (!projectStatus) {
      return NextResponse.json(
        { error: t("projectStatus.errors.not_found") },
        { status: 404 }
      )
    }

    return NextResponse.json(projectStatus)
  } catch (error) {
    console.error("Error fetching project status:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: DynamicRouteContext
) {
  const { t } = await initLocale(request)
  try {
    const { id } = await context.params

    const permError = await requirePermission(PERMISSIONS_GROUPED.LIST.UPDATE)
    if (permError) return permError

    const body = await request.json()
    const validation = validateRequest(updateProjectStatusSchema, body, t)
    if (validation.error) return validation.error

    const existingProjectStatus = await db.projectStatus.findUnique({
      where: { id },
    })

    if (!existingProjectStatus) {
      return NextResponse.json(
        { error: t("projectStatus.errors.not_found") },
        { status: 404 }
      )
    }

    const data = validation.data

    const projectStatus = await db.projectStatus.update({
      where: { id },
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        color: data.color,
      },
    })

    return NextResponse.json(projectStatus)
  } catch (error) {
    console.error("Error updating project status:", error)

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

    const existingProjectStatus = await db.projectStatus.findUnique({
      where: { id },
    })

    if (!existingProjectStatus) {
      return NextResponse.json(
        { error: t("projectStatus.errors.not_found") },
        { status: 404 }
      )
    }

    // System statuses cannot be deleted (fixed: Planning, In Progress, On Hold, Completed, Cancelled)
    if (existingProjectStatus.isSystem) {
      return NextResponse.json(
        { error: t("projectStatus.errors.cannot_delete_system") },
        { status: 403 }
      )
    }

    await db.projectStatus.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting project status:", error)

    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
