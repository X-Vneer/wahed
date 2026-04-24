import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import { Prisma } from "@/lib/generated/prisma/client"
import {
  initLocale,
  parsePagination,
  requirePermission,
  validateRequest,
} from "@/lib/helpers"
import { createTaskCategorySchema } from "@/lib/schemas/task-category"
import { transformTaskCategory } from "@/prisma/task-categories"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { locale, t } = await initLocale(request)
  try {
    // Get search query and filters from URL params
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("q")
    const status = searchParams.get("status")
    const { page, perPage, skip, take } = parsePagination(searchParams, {
      perPage: 15,
    })

    // Build where clause
    const where: Prisma.TaskCategoryWhereInput = {}

    if (search) {
      where.OR = [
        { nameAr: { contains: search, mode: "insensitive" } },
        { nameEn: { contains: search, mode: "insensitive" } },
      ]
    }

    if (status && status !== "all") {
      where.isActive = status === "active"
    }

    // Get total count for pagination
    const total = await db.taskCategory.count({ where })

    // Fetch task categories from database with pagination
    const taskCategories = await db.taskCategory.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
    })

    const transformedTaskCategories = taskCategories.map((taskCategory) => {
      return transformTaskCategory(taskCategory, locale)
    })

    const lastPage = Math.ceil(total / perPage)
    const from = total > 0 ? (page - 1) * perPage + 1 : 0
    const to = Math.min(page * perPage, total)

    return NextResponse.json({
      data: transformedTaskCategories,
      from,
      to,
      total,
      per_page: perPage,
      current_page: page,
      last_page: lastPage,
    })
  } catch (error) {
    console.error("Error fetching task categories:", error)
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
    const validation = validateRequest(createTaskCategorySchema, body, t)
    if (validation.error) return validation.error
    const data = validation.data

    // Create task category
    const taskCategory = await db.taskCategory.create({
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        isActive: data.isActive,
      },
    })

    return NextResponse.json(taskCategory, { status: 201 })
  } catch (error) {
    console.error("Error creating task category:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
