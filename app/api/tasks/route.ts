import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import { getAccessTokenPayload } from "@/lib/get-access-token"
import { getLocaleFromRequest } from "@/lib/i18n/utils"
import { createTaskSchema } from "@/lib/schemas/task"
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

    const body = await request.json()
    const validationResult = createTaskSchema.safeParse(body)

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

    const [project, status, categories, users, maxOrder] = await Promise.all([
      db.project.findUnique({
        where: { id: data.projectId },
        select: { id: true },
      }),
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
        where: { projectId: data.projectId },
        _max: { order: true },
      }),
    ])

    if (!project) {
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
        projectId: data.projectId,
        statusId: data.statusId,
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
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
