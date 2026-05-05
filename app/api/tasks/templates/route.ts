import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import { Prisma } from "@/lib/generated/prisma/client"
import { initLocale, parsePagination, requirePermission } from "@/lib/helpers"
import { tasksTemplateInclude } from "@/prisma/task-templates"
import { createTaskTemplateSchema } from "@/schemas/task-template"
import { transformZodError } from "@/utils/transform-errors"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { t } = await initLocale(request)
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("q")
    const status = searchParams.get("status")
    const { page, perPage, skip, take } = parsePagination(searchParams, {
      perPage: 15,
    })

    const where: Prisma.TaskTemplateWhereInput = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (status && status !== "all") {
      where.isActive = status === "active"
    }

    const total = await db.taskTemplate.count({ where })

    const taskTemplates = await db.taskTemplate.findMany({
      where,
      include: tasksTemplateInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    })

    const lastPage = Math.ceil(total / perPage)
    const from = total > 0 ? skip + 1 : 0
    const to = Math.min(page * perPage, total)

    return NextResponse.json({
      data: taskTemplates,
      from,
      to,
      total,
      per_page: perPage,
      current_page: page,
      last_page: lastPage,
    })
  } catch (error) {
    console.error("Error fetching task templates:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const { t } = await initLocale(request)
  try {
    const permError = await requirePermission(PERMISSIONS_GROUPED.TASK.CREATE)
    if (permError) return permError

    const body = await request.json()
    const validationResult = createTaskTemplateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: transformZodError(validationResult.error),
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    const taskTemplate = await db.taskTemplate.create({
      data: {
        title: data.title,
        description: data.description ?? undefined,
        estimatedWorkingDays: data.estimatedWorkingDays ?? undefined,
        priority: data.priority,
        defaultStatusId: data.defaultStatusId ?? undefined,
        isActive: data.isActive,
        categories:
          data.categoryIds.length > 0
            ? { connect: data.categoryIds.map((id) => ({ id })) }
            : undefined,
        subItems:
          data.subItems.length > 0
            ? {
                create: data.subItems.map((item) => ({
                  title: item.title,
                  description: item.description,
                  order: item.order,
                  startedAt: item.startedAt ?? null,
                  estimatedWorkingDays: item.estimatedWorkingDays ?? null,
                })),
              }
            : undefined,
      },
      include: tasksTemplateInclude,
    })

    return NextResponse.json(taskTemplate, { status: 201 })
  } catch (error) {
    console.error("Error creating task template:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
