import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import {
  DynamicRouteContext,
  initLocale,
  requireAuth,
  requirePermission,
  validateRequest,
} from "@/lib/helpers"
import {
  createNotifications,
  getTaskStakeholderIds,
} from "@/lib/notifications"
import { createSubTaskSchema } from "@/lib/schemas/task"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest,
  context: DynamicRouteContext
) {
  const { t } = await initLocale(request)
  try {
    const permError = await requirePermission(PERMISSIONS_GROUPED.TASK.UPDATE)
    if (permError) return permError

    const auth = await requireAuth(t)
    if (auth.error) return auth.error
    const { payload } = auth

    const { id: taskId } = await context.params
    const body = await request.json()
    const validation = validateRequest(createSubTaskSchema, body, t)
    if (validation.error) return validation.error

    const data = validation.data

    const task = await db.task.findUnique({
      where: { id: taskId },
      select: { id: true },
    })

    if (!task) {
      return NextResponse.json(
        { error: t("tasks.errors.not_found") },
        { status: 404 }
      )
    }

    const subtask = await db.subTasks.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        startedAt: data.startedAt ?? null,
        estimatedWorkingDays: data.estimatedWorkingDays ?? null,
        taskId,
        createdById: payload.userId,
      },
    })

    // Notify task stakeholders about new subtask
    const parentTask = await db.task.findUnique({
      where: { id: taskId },
      select: { title: true },
    })
    getTaskStakeholderIds(taskId).then(({ creatorId, assigneeIds }) => {
      const allIds = [...new Set([creatorId, ...assigneeIds].filter(Boolean))]
      const notifyIds = allIds.filter(
        (uid) => uid !== payload.userId
      ) as string[]
      if (notifyIds.length > 0) {
        createNotifications({
          userIds: notifyIds,
          type: "TASK_UPDATED",
          contentKey: "subtask_added",
          messageParams: { subtaskTitle: data.title, taskTitle: parentTask?.title ?? "" },
          relatedId: taskId,
          relatedType: "task",
        })
      }
    })

    return NextResponse.json(subtask, { status: 201 })
  } catch (error) {
    console.error("Error creating subtask:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
