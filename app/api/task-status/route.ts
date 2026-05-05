import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import { Prisma } from "@/lib/generated/prisma/client"
import {
  initLocale,
  parsePagination,
  requirePermission,
  validateRequest,
} from "@/lib/helpers"
import { createTaskStatusSchema } from "@/schemas/task-status"
import { transformTaskStatus } from "@/prisma/task-statuses"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { locale, t } = await initLocale(request)
  try {
    // Get search query and filters from URL params
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("q")
    const { page, perPage, skip, take } = parsePagination(searchParams, {
      perPage: 15,
    })

    // Build where clause
    const where: Prisma.TaskStatusWhereInput = {}

    if (search) {
      where.OR = [
        { nameAr: { contains: search, mode: "insensitive" } },
        { nameEn: { contains: search, mode: "insensitive" } },
      ]
    }

    // Get total count for pagination
    const total = await db.taskStatus.count({ where })

    // Fetch task statuses: system statuses first, then by createdAt desc
    const taskStatuses = await db.taskStatus.findMany({
      where,
      orderBy: [{ isSystem: "desc" }, { createdAt: "desc" }],
      skip,
      take,
    })

    const transformedTaskStatuses = taskStatuses.map((taskStatus) => {
      return transformTaskStatus(taskStatus, locale)
    })

    const lastPage = Math.ceil(total / perPage)
    const from = total > 0 ? (page - 1) * perPage + 1 : 0
    const to = Math.min(page * perPage, total)

    return NextResponse.json({
      data: transformedTaskStatuses,
      from,
      to,
      total,
      per_page: perPage,
      current_page: page,
      last_page: lastPage,
    })
  } catch (error) {
    console.log("🚀 ~ GET ~ error:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Get translations based on request locale
  const { t } = await initLocale(request)
  try {
    // Check permission
    const permError = await requirePermission(PERMISSIONS_GROUPED.LIST.CREATE)
    if (permError) return permError

    // Parse and validate request body
    const body = await request.json()
    const validation = validateRequest(createTaskStatusSchema, body, t)
    if (validation.error) return validation.error
    const data = validation.data

    // Create task status
    const taskStatus = await db.taskStatus.create({
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        color: data.color,
      },
    })

    return NextResponse.json(taskStatus, { status: 201 })
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
