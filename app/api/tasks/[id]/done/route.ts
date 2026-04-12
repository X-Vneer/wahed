import { PERMISSIONS_GROUPED, TASK_STATUS_ID_COMPLETED } from "@/config"
import db from "@/lib/db"
import { getAccessTokenPayload } from "@/lib/get-access-token"
import {
  createNotifications,
  getTaskStakeholderIds,
} from "@/lib/notifications"
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
    const permissionCheck = await hasPermission(PERMISSIONS_GROUPED.TASK.VIEW)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    const { id } = await context.params

    const existing = await db.task.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!existing) {
      return NextResponse.json(
        { error: t("tasks.errors.not_found") },
        { status: 404 }
      )
    }

    let body: { done?: boolean } = {}
    try {
      const raw = await request.json()
      if (raw && typeof raw === "object" && "done" in raw) {
        body = { done: Boolean(raw.done) }
      }
    } catch {
      // No body or invalid JSON: default to marking done
    }

    const done = body.done !== false

    const task = await db.task.update({
      where: { id },
      data: {
        doneAt: done ? new Date() : null,
        ...(done && { statusId: TASK_STATUS_ID_COMPLETED }),
      },
      include: taskInclude,
    })

    // Notify stakeholders about task completion
    const currentUser = await getAccessTokenPayload()
    getTaskStakeholderIds(id).then(({ creatorId, assigneeIds }) => {
      const allIds = [...new Set([creatorId, ...assigneeIds].filter(Boolean))]
      const notifyIds = allIds.filter(
        (uid) => uid !== currentUser?.userId
      ) as string[]
      if (notifyIds.length > 0) {
        createNotifications({
          userIds: notifyIds,
          type: "TASK_UPDATED",
          title: done ? "Task Completed" : "Task Reopened",
          message: done
            ? `Task "${task.title}" has been marked as done`
            : `Task "${task.title}" has been reopened`,
          relatedId: id,
          relatedType: "task",
        })
      }
    })

    return NextResponse.json(transformTask(task, locale))
  } catch (error) {
    console.error("Error setting task done:", error)
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
