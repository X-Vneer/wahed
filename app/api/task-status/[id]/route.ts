import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import {
  initLocale,
  requirePermission,
  validateRequest,
  type DynamicRouteContext,
} from "@/utils"
import { updateTaskStatusSchema } from "@/schemas/task-status"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, context: DynamicRouteContext) {
  const { t } = await initLocale(request)
  try {
    const { id } = await context.params

    const taskStatus = await db.taskStatus.findUnique({
      where: { id },
    })

    if (!taskStatus) {
      return NextResponse.json(
        { error: t("taskStatus.errors.not_found") },
        { status: 404 }
      )
    }

    return NextResponse.json(taskStatus)
  } catch (error) {
    console.error("Error fetching task status:", error)
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

    // Check permission
    const permError = await requirePermission(PERMISSIONS_GROUPED.LIST.UPDATE)
    if (permError) return permError

    // Parse and validate request body
    const body = await request.json()
    const validation = validateRequest(updateTaskStatusSchema, body, t)
    if (validation.error) return validation.error

    // Check if task status exists
    const existingTaskStatus = await db.taskStatus.findUnique({
      where: { id },
    })

    if (!existingTaskStatus) {
      return NextResponse.json(
        { error: t("taskStatus.errors.not_found") },
        { status: 404 }
      )
    }

    const data = validation.data

    // Update task status
    const taskStatus = await db.taskStatus.update({
      where: { id },
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        color: data.color,
      },
    })

    return NextResponse.json(taskStatus)
  } catch (error) {
    console.error("Error updating task status:", error)

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

    // Check permission
    const permError = await requirePermission(PERMISSIONS_GROUPED.LIST.DELETE)
    if (permError) return permError

    // Check if task status exists
    const existingTaskStatus = await db.taskStatus.findUnique({
      where: { id },
    })

    if (!existingTaskStatus) {
      return NextResponse.json(
        { error: t("taskStatus.errors.not_found") },
        { status: 404 }
      )
    }

    // System statuses cannot be deleted (fixed: Pending, In Progress, Canceled, Done)
    if (existingTaskStatus.isSystem) {
      return NextResponse.json(
        { error: t("taskStatus.errors.cannot_delete_system") },
        { status: 403 }
      )
    }

    // Delete task status
    await db.taskStatus.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting task status:", error)

    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
