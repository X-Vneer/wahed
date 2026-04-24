import { PERMISSIONS_GROUPED, TASK_STATUS_ID_IN_PROGRESS } from "@/config"
import db from "@/lib/db"
import {
  initLocale,
  requireAuth,
  requirePermission,
  validateRequest,
} from "@/lib/helpers"
import { getLocaleFromRequest } from "@/lib/i18n/utils"
import { createNotifications, getAdminUserIds } from "@/lib/notifications"
import {
  importTasksFromTemplatesSchema,
  type ImportTasksFromTemplatesInput,
} from "@/lib/schemas/task"
import { TaskPriority } from "@/lib/generated/prisma/enums"
import { taskInclude, transformTask } from "@/prisma/tasks"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { t } = await initLocale(request)
  try {
    const permError = await requirePermission(PERMISSIONS_GROUPED.TASK.CREATE)
    if (permError) return permError

    const auth = await requireAuth(t)
    if (auth.error) return auth.error
    const { payload } = auth

    const body = (await request.json()) as ImportTasksFromTemplatesInput
    const validation = validateRequest(
      importTasksFromTemplatesSchema,
      body,
      t
    )
    if (validation.error) return validation.error
    const data = validation.data

    const [project, maxOrder, templates] = await Promise.all([
      data.projectId
        ? db.project.findUnique({
            where: { id: data.projectId },
            select: { id: true },
          })
        : Promise.resolve(null),
      db.task.aggregate({
        where: { projectId: data.projectId ?? null },
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

    if (data.projectId && !project) {
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
              projectId: data.projectId ?? null,
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

    // Notify admins about bulk task creation
    getAdminUserIds().then((adminIds) => {
      const ids = adminIds.filter((id) => id !== payload.userId)
      if (ids.length > 0) {
        createNotifications({
          userIds: ids,
          type: "TASK_CREATED",
          contentKey: "tasks_imported",
          messageParams: { count: createdTasks.length },
          relatedId: data.projectId ?? createdTasks[0]?.id,
          relatedType: data.projectId ? "project" : "task",
        })
      }
    })

    const responseLocale = getLocaleFromRequest(request)

    return NextResponse.json(
      createdTasks.map((task) => transformTask(task, responseLocale)),
      {
        status: 201,
      }
    )
  } catch (error) {
    console.error("Error importing tasks from templates:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
