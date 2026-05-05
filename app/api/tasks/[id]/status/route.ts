import { PERMISSIONS_GROUPED, TASK_STATUS_ID_IN_PROGRESS } from "@/config"
import db from "@/lib/db"
import { NotificationCategory } from "@/lib/generated/prisma/enums"
import { getAccessTokenPayload } from "@/lib/get-access-token"
import {
  DynamicRouteContext,
  initLocale,
  requirePermission,
  validateRequest,
} from "@/lib/helpers"
import { getLocaleFromRequest } from "@/lib/i18n/utils"
import { createNotifications, getTaskStakeholderIds } from "@/lib/notifications"
import { changeTaskStatusSchema } from "@/schemas/task"
import { taskInclude, transformTask } from "@/prisma/tasks"
import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(
  request: NextRequest,
  context: DynamicRouteContext
) {
  const { t } = await initLocale(request)
  try {
    const permError = await requirePermission(PERMISSIONS_GROUPED.TASK.UPDATE)
    if (permError) return permError
    const { id } = await context.params
    const body = await request.json()
    const validation = validateRequest(changeTaskStatusSchema, body, t)
    if (validation.error) return validation.error

    const { statusId } = validation.data

    const [existing, status] = await Promise.all([
      db.task.findUnique({
        where: { id },
        select: { id: true, startedAt: true },
      }),
      db.taskStatus.findUnique({
        where: { id: statusId },
        select: { id: true },
      }),
    ])

    if (!existing) {
      return NextResponse.json(
        { error: t("tasks.errors.not_found") },
        { status: 404 }
      )
    }

    if (!status) {
      return NextResponse.json(
        { error: t("tasks.errors.invalid_status") },
        { status: 400 }
      )
    }

    const task = await db.task.update({
      where: { id },
      data: {
        statusId,
        ...(statusId === TASK_STATUS_ID_IN_PROGRESS &&
          existing.startedAt == null && {
            startedAt: new Date(),
          }),
      },
      include: taskInclude,
    })

    // Notify stakeholders about status change
    const currentUser = await getAccessTokenPayload()
    const statusName = await db.taskStatus.findUnique({
      where: { id: statusId },
      select: { nameEn: true, nameAr: true },
    })
    getTaskStakeholderIds(id).then(({ creatorId, assigneeIds }) => {
      const allIds = [...new Set([creatorId, ...assigneeIds].filter(Boolean))]
      const notifyIds = allIds.filter(
        (uid) => uid !== currentUser?.userId
      ) as string[]
      if (notifyIds.length > 0) {
        createNotifications({
          userIds: notifyIds,
          category: NotificationCategory.TASK_STATUS_CHANGED,
          messageParams: {
            taskTitle: task.title,
            statusName: statusName?.nameEn ?? "",
          },
          relatedId: id,
          relatedType: "task",
        })
      }
    })

    const responseLocale = getLocaleFromRequest(request)
    return NextResponse.json(transformTask(task, responseLocale))
  } catch (error) {
    console.error("Error changing task status:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
