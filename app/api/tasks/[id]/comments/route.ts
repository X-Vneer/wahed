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
import { createTaskCommentSchema } from "@/lib/schemas/task"
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
    const validation = validateRequest(createTaskCommentSchema, body, t)
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

    const comment = await db.taskComment.create({
      data: {
        content: data.content,
        taskId,
        createdById: payload.userId,
      },
      include: {
        createdBy: { select: { id: true, name: true, image: true } },
      },
    })

    // Notify task stakeholders about the new comment
    getTaskStakeholderIds(taskId).then(({ creatorId, assigneeIds }) => {
      const allIds = [...new Set([creatorId, ...assigneeIds].filter(Boolean))]
      const notifyIds = allIds.filter(
        (uid) => uid !== payload.userId
      ) as string[]

      if (notifyIds.length > 0) {
        createNotifications({
          userIds: notifyIds,
          type: "TASK_COMMENTED",
          contentKey: "task_commented",
          messageParams: { userName: comment.createdBy.name, comment: data.content.substring(0, 100) },
          relatedId: taskId,
          relatedType: "task",
        })
      }
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error("Error creating task comment:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, context: DynamicRouteContext) {
  const { t } = await initLocale(request)
  try {
    const permError = await requirePermission(PERMISSIONS_GROUPED.TASK.VIEW)
    if (permError) return permError

    const { id: taskId } = await context.params

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

    const comments = await db.taskComment.findMany({
      where: { taskId },
      include: {
        createdBy: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Error fetching task comments:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}


