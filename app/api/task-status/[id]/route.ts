import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import { updateTaskStatusSchema } from "@/lib/schemas/task-status"
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

export async function GET(request: NextRequest, context: RouteContext) {
  const locale = await getReqLocale(request)
  const t = await getTranslations(locale)
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

export async function PUT(request: NextRequest, context: RouteContext) {
  const locale = await getReqLocale(request)
  const t = await getTranslations(locale)
  try {
    const { id } = await context.params

    // Check permission
    const permissionCheck = await hasPermission(PERMISSIONS_GROUPED.LIST.UPDATE)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = updateTaskStatusSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: transformZodError(validationResult.error),
        },
        { status: 400 }
      )
    }

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

    const data = validationResult.data

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

export async function DELETE(request: NextRequest, context: RouteContext) {
  const locale = await getReqLocale(request)
  const t = await getTranslations(locale)
  try {
    const { id } = await context.params

    // Check permission
    const permissionCheck = await hasPermission(PERMISSIONS_GROUPED.LIST.DELETE)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

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
