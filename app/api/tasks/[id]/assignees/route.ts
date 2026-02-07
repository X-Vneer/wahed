import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
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

    const task = await db.task.update({
      where: { id },
      data: {
        assignedTo: {
          set: assignedToIds.map((userId) => ({ id: userId })),
        },
      },
      include: taskDetailInclude,
    })

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
