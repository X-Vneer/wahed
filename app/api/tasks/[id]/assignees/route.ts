import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import { NotificationCategory } from "@/lib/generated/prisma/enums"
import { getAccessTokenPayload } from "@/lib/get-access-token"
import {
  DynamicRouteContext,
  initLocale,
  requirePermission,
  validateRequest,
} from "@/lib/helpers"
import { createNotifications } from "@/lib/notifications"
import { updateTaskAssigneesSchema } from "@/schemas/task"
import { taskDetailInclude, transformTaskDetail } from "@/prisma/tasks"
import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(
  request: NextRequest,
  context: DynamicRouteContext
) {
  const { locale, t } = await initLocale(request)
  try {
    const permError = await requirePermission(PERMISSIONS_GROUPED.TASK.ASSIGN)
    if (permError) return permError

    const { id } = await context.params
    const body = await request.json()
    const validation = validateRequest(updateTaskAssigneesSchema, body, t)
    if (validation.error) return validation.error

    const { assignedToIds } = validation.data

    const [existing, users] = await Promise.all([
      db.task.findUnique({
        where: { id },
        select: { id: true },
      }),
      assignedToIds.length > 0
        ? db.user.findMany({
            where: { id: { in: assignedToIds }, isActive: true },
            select: { id: true },
          })
        : Promise.resolve([]),
    ])

    if (!existing) {
      return NextResponse.json(
        { error: t("tasks.errors.not_found") },
        { status: 404 }
      )
    }

    if (assignedToIds.length > 0 && users.length !== assignedToIds.length) {
      return NextResponse.json(
        { error: t("tasks.errors.invalid_assigned_to") },
        { status: 400 }
      )
    }

    // Get previous assignees to detect new ones
    const previousTask = await db.task.findUnique({
      where: { id },
      select: {
        title: true,
        assignedTo: { select: { id: true } },
      },
    })
    const previousAssigneeIds = previousTask?.assignedTo.map((u) => u.id) ?? []

    const task = await db.task.update({
      where: { id },
      data: {
        assignedTo: {
          set: assignedToIds.map((userId) => ({ id: userId })),
        },
      },
      include: taskDetailInclude,
    })

    // Notify newly assigned users
    const currentUser = await getAccessTokenPayload()
    const newAssignees = assignedToIds.filter(
      (uid) => !previousAssigneeIds.includes(uid) && uid !== currentUser?.userId
    )
    if (newAssignees.length > 0) {
      createNotifications({
        userIds: newAssignees,
        category: NotificationCategory.TASK_ASSIGNED,
        messageParams: { taskTitle: previousTask?.title ?? task.title },
        relatedId: id,
        relatedType: "task",
      })
    }

    // Notify removed users
    const removedAssignees = previousAssigneeIds.filter(
      (uid) => !assignedToIds.includes(uid) && uid !== currentUser?.userId
    )
    if (removedAssignees.length > 0) {
      createNotifications({
        userIds: removedAssignees,
        category: NotificationCategory.TASK_UNASSIGNED,
        messageParams: { taskTitle: previousTask?.title ?? task.title },
        relatedId: id,
        relatedType: "task",
      })
    }

    return NextResponse.json(transformTaskDetail(task, locale))
  } catch (error) {
    console.error("Error updating task assignees:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
