import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import { getAccessTokenPayload } from "@/lib/get-access-token"
import { getLocaleFromRequest } from "@/lib/i18n/utils"
import { updateTaskSchema } from "@/lib/schemas/task"
import { transformZodError } from "@/lib/transform-errors"
import { TaskPriority } from "@/lib/generated/prisma/enums"
import { taskInclude, transformTask } from "@/prisma/tasks"
import { getReqLocale } from "@/utils/get-req-locale"
import { hasPermission } from "@/utils/has-permission"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })
    const permissionCheck = await hasPermission(PERMISSIONS_GROUPED.TASK.UPDATE)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    const { id } = await context.params
    const body = await request.json()
    const validationResult = updateTaskSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: t("errors.validation_failed"),
          details: transformZodError(validationResult.error),
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    const existing = await db.task.findUnique({
      where: { id },
      select: { id: true, projectId: true },
    })

    if (!existing) {
      return NextResponse.json(
        { error: t("tasks.errors.not_found") },
        { status: 404 }
      )
    }

    const validationQueries: Promise<unknown>[] = []
    if (data.statusId !== undefined) {
      validationQueries.push(
        db.taskStatus.findUnique({
          where: { id: data.statusId },
          select: { id: true },
        })
      )
    }
    if (data.categoryIds !== undefined && data.categoryIds.length > 0) {
      validationQueries.push(
        db.taskCategory.findMany({
          where: { id: { in: data.categoryIds } },
          select: { id: true },
        })
      )
    }
    if (data.assignedToIds !== undefined && data.assignedToIds.length > 0) {
      validationQueries.push(
        db.user.findMany({
          where: { id: { in: data.assignedToIds }, isActive: true },
          select: { id: true },
        })
      )
    }

    const results = await Promise.all(validationQueries)
    let idx = 0
    if (data.statusId !== undefined) {
      const status = results[idx++] as { id: string } | null
      if (!status) {
        return NextResponse.json(
          { error: t("tasks.errors.invalid_status") },
          { status: 400 }
        )
      }
    }
    if (data.categoryIds !== undefined && data.categoryIds.length > 0) {
      const categories = results[idx++] as { id: string }[]
      if (categories.length !== data.categoryIds.length) {
        return NextResponse.json(
          { error: t("tasks.errors.invalid_categories") },
          { status: 400 }
        )
      }
    }
    if (data.assignedToIds !== undefined && data.assignedToIds.length > 0) {
      const users = results[idx++] as { id: string }[]
      if (users.length !== data.assignedToIds.length) {
        return NextResponse.json(
          { error: t("tasks.errors.invalid_assigned_to") },
          { status: 400 }
        )
      }
    }

    const updateData: Parameters<typeof db.task.update>[0]["data"] = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined)
      updateData.description = data.description
    if (data.statusId !== undefined) updateData.statusId = data.statusId
    if (data.estimatedWorkingDays !== undefined)
      updateData.estimatedWorkingDays = data.estimatedWorkingDays
    if (data.priority !== undefined)
      updateData.priority = data.priority as TaskPriority
    if (data.categoryIds !== undefined) {
      updateData.category = {
        set: data.categoryIds.map((id) => ({ id })),
      }
    }
    if (data.assignedToIds !== undefined) {
      updateData.assignedTo = {
        set: data.assignedToIds.map((id) => ({ id })),
      }
    }

    const task = await db.task.update({
      where: { id },
      data: updateData,
      include: taskInclude,
    })

    const responseLocale = getLocaleFromRequest(request)
    return NextResponse.json(transformTask(task, responseLocale))
  } catch (error) {
    console.error("Error updating task:", error)
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
