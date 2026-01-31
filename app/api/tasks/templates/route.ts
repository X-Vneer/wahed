import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import { Prisma } from "@/lib/generated/prisma/client"
import { tasksTemplateInclude } from "@/prisma/task-templates"
import { createTaskTemplateSchema } from "@/lib/schemas/task-template"
import { transformZodError } from "@/lib/transform-errors"
import { getReqLocale } from "@/utils/get-req-locale"
import { hasPermission } from "@/utils/has-permission"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("q")
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const perPage = parseInt(searchParams.get("per_page") || "15", 10)

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
      skip: (page - 1) * perPage,
      take: perPage,
    })

    const lastPage = Math.ceil(total / perPage)
    const from = total > 0 ? (page - 1) * perPage + 1 : 0
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
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })
  try {
    const permissionCheck = await hasPermission(PERMISSIONS_GROUPED.TASK.CREATE)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

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
