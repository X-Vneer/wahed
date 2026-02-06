import { PERMISSIONS_GROUPED, TASK_STATUS_ID_COMPLETED } from "@/config"
import db from "@/lib/db"
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
    const permissionCheck = await hasPermission(
      PERMISSIONS_GROUPED.TASK.COMPLETE
    )
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
