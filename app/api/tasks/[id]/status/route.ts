import { PERMISSIONS_GROUPED, TASK_STATUS_ID_IN_PROGRESS } from "@/config"
import db from "@/lib/db"
import { getLocaleFromRequest } from "@/lib/i18n/utils"
import { changeTaskStatusSchema } from "@/lib/schemas/task"
import { transformZodError } from "@/lib/transform-errors"
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
    const validationResult = changeTaskStatusSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: t("errors.validation_failed"),
          details: transformZodError(validationResult.error),
        },
        { status: 400 }
      )
    }

    const { statusId } = validationResult.data

    const [existing, status] = await Promise.all([
      db.task.findUnique({
        where: { id },
        select: { id: true },
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
        ...(statusId === TASK_STATUS_ID_IN_PROGRESS && {
          startedAt: new Date(),
        }),
      },
      include: taskInclude,
    })

    const responseLocale = getLocaleFromRequest(request)
    return NextResponse.json(transformTask(task, responseLocale))
  } catch (error) {
    console.error("Error changing task status:", error)
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
