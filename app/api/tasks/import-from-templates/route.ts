import { PERMISSIONS_GROUPED, TASK_STATUS_ID_IN_PROGRESS } from "@/config"
import db from "@/lib/db"
import { getAccessTokenPayload } from "@/lib/get-access-token"
import { getLocaleFromRequest } from "@/lib/i18n/utils"
import {
  importTasksFromTemplatesSchema,
  type ImportTasksFromTemplatesInput,
} from "@/lib/schemas/task"
import { transformZodError } from "@/lib/transform-errors"
import { TaskPriority } from "@/lib/generated/prisma/enums"
import { taskInclude, transformTask } from "@/prisma/tasks"
import { getReqLocale } from "@/utils/get-req-locale"
import { hasPermission } from "@/utils/has-permission"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })

    const permissionCheck = await hasPermission(PERMISSIONS_GROUPED.TASK.CREATE)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    const payload = await getAccessTokenPayload()
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: t("errors.unauthorized") },
        { status: 401 }
      )
    }

    const body = (await request.json()) as ImportTasksFromTemplatesInput
    const validationResult = importTasksFromTemplatesSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: t("errors.validation_failed"),
          details: transformZodError(validationResult.error),
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    const [project, maxOrder, templates] = await Promise.all([
      db.project.findUnique({
        where: { id: data.projectId },
        select: { id: true },
      }),
      db.task.aggregate({
        where: { projectId: data.projectId },
        _max: { order: true },
      }),
      db.taskTemplate.findMany({
        where: { id: { in: data.templateIds }, isActive: true },
        include: {
          defaultStatus: true,
          categories: true,
          subItems: { orderBy: { order: "asc" } },
        },
      }),
    ])

    if (!project) {
      return NextResponse.json(
        { error: t("projects.errors.not_found") },
        { status: 404 }
      )
    }

    if (templates.length !== data.templateIds.length) {
      return NextResponse.json(
        { error: t("tasks.errors.invalid_templates") },
        { status: 400 }
      )
    }

    if (data.statusId) {
      const status = await db.taskStatus.findUnique({
        where: { id: data.statusId },
        select: { id: true },
      })

      if (!status) {
        return NextResponse.json(
          { error: t("tasks.errors.invalid_status") },
          { status: 400 }
        )
      }
    } else {
      const templatesMissingStatus = templates.filter(
        (tpl) => !tpl.defaultStatusId
      )
      if (templatesMissingStatus.length > 0) {
        return NextResponse.json(
          { error: t("tasks.errors.templates_missing_status") },
          { status: 400 }
        )
      }
    }

    const startingOrder = (maxOrder._max.order ?? -1) + 1

    const createdTasks = await db.$transaction(
      async (tx) => {
        let currentOrder = startingOrder
        const tasks = []

        for (const template of templates) {
          const statusIdToUse = data.statusId ?? template.defaultStatusId!

          const task = await tx.task.create({
            data: {
              title: template.title,
              description: template.description ?? null,
              projectId: data.projectId,
              statusId: statusIdToUse,
              ...(statusIdToUse === TASK_STATUS_ID_IN_PROGRESS && {
                startedAt: new Date(),
              }),
              estimatedWorkingDays: template.estimatedWorkingDays ?? null,
              priority:
                (template.priority as TaskPriority | null) ?? TaskPriority.MEDIUM,
              order: currentOrder++,
              createdById: payload.userId,
              category:
                template.categories.length > 0
                  ? {
                      connect: template.categories.map((c) => ({ id: c.id })),
                    }
                  : undefined,
              subTasks:
                template.subItems.length > 0
                  ? {
                      create: template.subItems.map((item) => ({
                        title: item.title,
                        description: item.description ?? null,
                        createdById: payload.userId,
                      })),
                    }
                  : undefined,
            },
            include: taskInclude,
          })

          tasks.push(task)
        }

        return tasks
      },
      {
        timeout: 30_000, // 30s for many templates with nested subTasks
      }
    )

    const responseLocale = getLocaleFromRequest(request)

    return NextResponse.json(
      createdTasks.map((task) => transformTask(task, responseLocale)),
      {
        status: 201,
      }
    )
  } catch (error) {
    console.error("Error importing tasks from templates:", error)
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
