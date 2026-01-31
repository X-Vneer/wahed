import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import { updateTaskTemplateSchema } from "@/lib/schemas/task-template"
import { transformZodError } from "@/lib/transform-errors"
import { tasksTemplateInclude } from "@/prisma/task-templates"
import { getReqLocale } from "@/utils/get-req-locale"
import { hasPermission } from "@/utils/has-permission"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })
  try {
    const { id } = await context.params

    const taskTemplate = await db.taskTemplate.findUnique({
      where: { id },
      include: tasksTemplateInclude,
    })

    if (!taskTemplate) {
      return NextResponse.json(
        { error: t("taskTemplate.errors.not_found") },
        { status: 404 }
      )
    }

    return NextResponse.json(taskTemplate)
  } catch (error) {
    console.error("Error fetching task template:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })
  try {
    const { id } = await context.params

    const permissionCheck = await hasPermission(PERMISSIONS_GROUPED.TASK.UPDATE)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    const body = await request.json()
    const validationResult = updateTaskTemplateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: transformZodError(validationResult.error),
        },
        { status: 400 }
      )
    }

    const existing = await db.taskTemplate.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: t("taskTemplate.errors.not_found") },
        { status: 404 }
      )
    }

    const data = validationResult.data

    const updateData: Parameters<typeof db.taskTemplate.update>[0]["data"] = {}

    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined)
      updateData.description = data.description
    if (data.estimatedWorkingDays !== undefined)
      updateData.estimatedWorkingDays = data.estimatedWorkingDays
    if (data.priority !== undefined) updateData.priority = data.priority
    if (data.defaultStatusId !== undefined)
      updateData.defaultStatusId = data.defaultStatusId
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    if (data.categoryIds !== undefined) {
      updateData.categories = {
        set: data.categoryIds.map((categoryId) => ({ id: categoryId })),
      }
    }

    if (data.subItems !== undefined) {
      updateData.subItems = {
        deleteMany: {},
        create: data.subItems.map((item) => ({
          title: item.title,
          description: item.description,
          order: item.order,
        })),
      }
    }

    const taskTemplate = await db.taskTemplate.update({
      where: { id },
      data: updateData,
      include: tasksTemplateInclude,
    })

    return NextResponse.json(taskTemplate)
  } catch (error) {
    console.error("Error updating task template:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })
  try {
    const { id } = await context.params

    const permissionCheck = await hasPermission(PERMISSIONS_GROUPED.TASK.DELETE)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    const existing = await db.taskTemplate.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: t("taskTemplate.errors.not_found") },
        { status: 404 }
      )
    }

    await db.taskTemplate.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting task template:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
