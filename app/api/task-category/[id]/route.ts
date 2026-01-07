import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import { updateTaskCategorySchema } from "@/lib/schemas/task-category"
import { transformZodError } from "@/lib/transform-errors"
import { hasPermission } from "@/utils/has-permission"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const t = await getTranslations()

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
    const t = await getTranslations()
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const t = await getTranslations()

    // Check permission
    const permissionCheck = await hasPermission(PERMISSIONS_GROUPED.LIST.UPDATE)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = updateTaskCategorySchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: transformZodError(validationResult.error),
        },
        { status: 400 }
      )
    }

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

    const data = validationResult.data

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
    const t = await getTranslations()
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const t = await getTranslations()

    // Check permission
    const permissionCheck = await hasPermission(PERMISSIONS_GROUPED.LIST.DELETE)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

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
    console.error("Error deleting task category:", error)
    const t = await getTranslations()
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
