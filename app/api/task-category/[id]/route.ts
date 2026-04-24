import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import {
  initLocale,
  requirePermission,
  validateRequest,
  type DynamicRouteContext,
} from "@/lib/helpers"
import { updateTaskCategorySchema } from "@/lib/schemas/task-category"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  context: DynamicRouteContext
) {
  const { t } = await initLocale(request)
  try {
    const { id } = await context.params

    const taskCategory = await db.taskCategory.findUnique({
      where: { id },
    })

    if (!taskCategory) {
      return NextResponse.json(
        { error: t("taskCategory.errors.not_found") },
        { status: 404 }
      )
    }

    return NextResponse.json(taskCategory)
  } catch (error) {
    console.error("Error fetching task category:", error)
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

    // Check permission
    const permError = await requirePermission(PERMISSIONS_GROUPED.LIST.UPDATE)
    if (permError) return permError

    // Parse and validate request body
    const body = await request.json()
    const validation = validateRequest(updateTaskCategorySchema, body, t)
    if (validation.error) return validation.error

    // Check if task category exists
    const existingTaskCategory = await db.taskCategory.findUnique({
      where: { id },
    })

    if (!existingTaskCategory) {
      return NextResponse.json(
        { error: t("taskCategory.errors.not_found") },
        { status: 404 }
      )
    }

    const data = validation.data

    // Update task category
    const taskCategory = await db.taskCategory.update({
      where: { id },
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        isActive: data.isActive,
      },
    })

    return NextResponse.json(taskCategory)
  } catch (error) {
    console.error("Error updating task category:", error)
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

    // Check if task category exists
    const existingTaskCategory = await db.taskCategory.findUnique({
      where: { id },
    })

    if (!existingTaskCategory) {
      return NextResponse.json(
        { error: t("taskCategory.errors.not_found") },
        { status: 404 }
      )
    }

    // Delete task category
    await db.taskCategory.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
