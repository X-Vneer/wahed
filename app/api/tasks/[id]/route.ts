import { PERMISSIONS_GROUPED, TASK_STATUS_ID_IN_PROGRESS } from "@/config"
import db from "@/lib/db"
import { getAccessTokenPayload } from "@/lib/get-access-token"
import {
  type DynamicRouteContext,
  initLocale,
  requirePermission,
  validateRequest,
} from "@/utils"
import {
  NotificationCategory,
  TaskPriority,
} from "@/lib/generated/prisma/enums"
import { createNotifications, getTaskStakeholderIds } from "@/lib/notifications"
import { updateTaskSchema } from "@/schemas/task"
import {
  taskDetailInclude,
  transformTask,
  transformTaskDetail,
} from "@/prisma/tasks"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, context: DynamicRouteContext) {
  const { locale, t } = await initLocale(request)
  try {
    const permError = await requirePermission(PERMISSIONS_GROUPED.TASK.VIEW)
    if (permError) return permError

    const { id } = await context.params

    const task = await db.task.findUnique({
      where: { id },
      include: taskDetailInclude,
    })

    if (!task) {
      return NextResponse.json(
        { error: t("tasks.errors.not_found") },
        { status: 404 }
      )
    }

    return NextResponse.json(transformTaskDetail(task, locale))
  } catch (error) {
    console.error("Error fetching task:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  context: DynamicRouteContext
) {
  const { locale, t } = await initLocale(request)
  try {
    const permError = await requirePermission(PERMISSIONS_GROUPED.TASK.UPDATE)
    if (permError) return permError

    const { id } = await context.params
    const body = await request.json()
    const validation = validateRequest(updateTaskSchema, body, t)
    if (validation.error) return validation.error
    const data = validation.data

    const existing = await db.task.findUnique({
      where: { id },
      select: { id: true, projectId: true, startedAt: true },
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
    if (data.statusId !== undefined) {
      updateData.statusId = data.statusId
      if (
        data.statusId === TASK_STATUS_ID_IN_PROGRESS &&
        existing.startedAt == null &&
        data.startedAt === undefined
      ) {
        updateData.startedAt = new Date()
      }
    }
    if (data.startedAt !== undefined) {
      updateData.startedAt = data.startedAt
    }
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
      include: taskDetailInclude,
    })

    // Notify task stakeholders about the update
    const currentUser = await getAccessTokenPayload()
    const currentUserId = currentUser?.userId
    getTaskStakeholderIds(id).then(({ creatorId, assigneeIds }) => {
      const allIds = [...new Set([creatorId, ...assigneeIds].filter(Boolean))]
      const notifyIds = allIds.filter(
        (uid) => uid !== currentUserId
      ) as string[]

      if (notifyIds.length > 0) {
        createNotifications({
          userIds: notifyIds,
          category: NotificationCategory.TASK_UPDATED,
          messageParams: { taskTitle: task.title },
          relatedId: id,
          relatedType: "task",
        })
      }
    })

    // Notify newly assigned users
    if (data.assignedToIds !== undefined) {
      const newAssignees = data.assignedToIds.filter(
        (uid) => uid !== currentUserId
      )
      if (newAssignees.length > 0) {
        createNotifications({
          userIds: newAssignees,
          category: NotificationCategory.TASK_ASSIGNED,
          messageParams: { taskTitle: task.title },
          relatedId: id,
          relatedType: "task",
        })
      }
    }

    return NextResponse.json(transformTask(task, locale))
  } catch (error) {
    console.error("Error updating task:", error)
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
    const permError = await requirePermission(PERMISSIONS_GROUPED.TASK.DELETE)
    if (permError) return permError

    const { id } = await context.params

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

    await db.task.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
