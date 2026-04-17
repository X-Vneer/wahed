import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import { getAccessTokenPayload } from "@/lib/get-access-token"
import { createNotifications } from "@/lib/notifications"
import { updateTaskAssigneesSchema } from "@/lib/schemas/task"
import { transformZodError } from "@/lib/transform-errors"
import { taskDetailInclude, transformTaskDetail } from "@/prisma/tasks"
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
    const permissionCheck = await hasPermission(PERMISSIONS_GROUPED.TASK.ASSIGN)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    const { id } = await context.params
    const body = await request.json()
    const validationResult = updateTaskAssigneesSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: t("errors.validation_failed"),
          details: transformZodError(validationResult.error),
        },
        { status: 400 }
      )
    }

    const { assignedToIds } = validationResult.data

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
      (uid) =>
        !previousAssigneeIds.includes(uid) && uid !== currentUser?.userId
    )
    if (newAssignees.length > 0) {
      createNotifications({
        userIds: newAssignees,
        type: "TASK_ASSIGNED",
        contentKey: "task_assigned",
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
        type: "TASK_UPDATED",
        contentKey: "task_unassigned",
        messageParams: { taskTitle: previousTask?.title ?? task.title },
        relatedId: id,
        relatedType: "task",
      })
    }

    return NextResponse.json(transformTaskDetail(task, locale))
  } catch (error) {
    console.error("Error updating task assignees:", error)
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
