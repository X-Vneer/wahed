import { PERMISSIONS_GROUPED, TASK_STATUS_ID_IN_PROGRESS } from "@/config"
import db from "@/lib/db"
import {
  initLocale,
  requireAuth,
  requirePermission,
  validateRequest,
} from "@/lib/helpers"
import { getLocaleFromRequest } from "@/lib/i18n/utils"
import { createTaskSchema } from "@/lib/schemas/task"
import { TaskPriority } from "@/lib/generated/prisma/enums"
import {
  createNotifications,
  getAdminUserIds,
} from "@/lib/notifications"
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

    const body = await request.json()
    const validation = validateRequest(createTaskSchema, body, t)
    if (validation.error) return validation.error
    const data = validation.data

    const [project, status, categories, users, maxOrder] = await Promise.all([
      data.projectId
        ? db.project.findUnique({
            where: { id: data.projectId },
            select: { id: true },
          })
        : Promise.resolve(null),
      db.taskStatus.findUnique({
        where: { id: data.statusId },
        select: { id: true },
      }),
      data.categoryIds.length > 0
        ? db.taskCategory.findMany({
            where: { id: { in: data.categoryIds } },
            select: { id: true },
          })
        : Promise.resolve([]),
      data.assignedToIds.length > 0
        ? db.user.findMany({
            where: { id: { in: data.assignedToIds }, isActive: true },
            select: { id: true },
          })
        : Promise.resolve([]),
      db.task.aggregate({
        where: { projectId: data.projectId ?? null },
        _max: { order: true },
      }),
    ])

    if (data.projectId && !project) {
      return NextResponse.json(
        { error: t("projects.errors.not_found") },
        { status: 404 }
      )
    }

    if (!status) {
      return NextResponse.json(
        { error: t("tasks.errors.invalid_status") },
        { status: 400 }
      )
    }

    if (
      data.categoryIds.length > 0 &&
      categories.length !== data.categoryIds.length
    ) {
      return NextResponse.json(
        { error: t("tasks.errors.invalid_categories") },
        { status: 400 }
      )
    }

    if (
      data.assignedToIds.length > 0 &&
      users.length !== data.assignedToIds.length
    ) {
      return NextResponse.json(
        { error: t("tasks.errors.invalid_assigned_to") },
        { status: 400 }
      )
    }

    const order = (maxOrder._max.order ?? -1) + 1

    const task = await db.task.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        projectId: data.projectId ?? null,
        statusId: data.statusId,
        ...(data.statusId === TASK_STATUS_ID_IN_PROGRESS && {
          startedAt: new Date(),
        }),
        estimatedWorkingDays: data.estimatedWorkingDays ?? null,
        priority: data.priority as TaskPriority,
        order,
        createdById: payload.userId,
        category:
          data.categoryIds.length > 0
            ? { connect: data.categoryIds.map((id) => ({ id })) }
            : undefined,
        assignedTo:
          data.assignedToIds.length > 0
            ? { connect: data.assignedToIds.map((id) => ({ id })) }
            : undefined,
        subTasks:
          data.subTasks.length > 0
            ? {
                create: data.subTasks.map((st) => ({
                  title: st.title,
                  description: st.description ?? null,
                  createdById: payload.userId,
                })),
              }
            : undefined,
      },
      include: taskInclude,
    })

    // Notify assigned users about new task
    const notifyUserIds = [
      ...data.assignedToIds.filter((id) => id !== payload.userId),
    ]
    if (notifyUserIds.length > 0) {
      createNotifications({
        userIds: notifyUserIds,
        type: "TASK_ASSIGNED",
        contentKey: "new_task_assigned",
        messageParams: { taskTitle: data.title },
        relatedId: task.id,
        relatedType: "task",
      })
    }

    // Notify admins about new task creation
    getAdminUserIds().then((adminIds) => {
      const ids = adminIds.filter((id) => id !== payload.userId)
      if (ids.length > 0) {
        createNotifications({
          userIds: ids,
          type: "TASK_CREATED",
          contentKey: "task_created",
          messageParams: { taskTitle: data.title },
          relatedId: task.id,
          relatedType: "task",
        })
      }
    })

    // Optionally save this task as a reusable template
    if (data.saveAsTemplate) {
      try {
        await db.taskTemplate.create({
          data: {
            title: data.title,
            description: data.description ?? undefined,
            estimatedWorkingDays: data.estimatedWorkingDays ?? undefined,
            priority: (data.priority as TaskPriority) ?? TaskPriority.MEDIUM,
            defaultStatusId: data.statusId,
            isActive: true,
            categories:
              data.categoryIds.length > 0
                ? { connect: data.categoryIds.map((id) => ({ id })) }
                : undefined,
            subItems:
              data.subTasks.length > 0
                ? {
                    create: data.subTasks.map((st, index) => ({
                      title: st.title,
                      description: st.description ?? undefined,
                      order: index,
                    })),
                  }
                : undefined,
          },
        })
      } catch (error) {
        // Template creation is non-blocking; log and continue
        console.error("Error creating task template from task:", error)
      }
    }

    const responseLocale = getLocaleFromRequest(request)
    return NextResponse.json(transformTask(task, responseLocale), {
      status: 201,
    })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
