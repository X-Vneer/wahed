import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import { Prisma } from "@/lib/generated/prisma/client"
import {
  initLocale,
  parsePagination,
  requirePermission,
  validateRequest,
} from "@/lib/helpers"
import { createProjectStatusSchema } from "@/schemas/project-status"
import { transformProjectStatus } from "@/prisma/project-statuses"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { locale, t } = await initLocale(request)
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("q")
    const { page, perPage, skip, take } = parsePagination(searchParams, {
      perPage: 15,
    })

    const where: Prisma.ProjectStatusWhereInput = {}

    if (search) {
      where.OR = [
        { nameAr: { contains: search, mode: "insensitive" } },
        { nameEn: { contains: search, mode: "insensitive" } },
      ]
    }

    const total = await db.projectStatus.count({ where })

    const projectStatuses = await db.projectStatus.findMany({
      where,
      orderBy: [{ isSystem: "desc" }, { createdAt: "desc" }],
      skip,
      take,
    })

    const transformedProjectStatuses = projectStatuses.map((projectStatus) =>
      transformProjectStatus(projectStatus, locale)
    )

    const lastPage = Math.ceil(total / perPage)
    const from = total > 0 ? (page - 1) * perPage + 1 : 0
    const to = Math.min(page * perPage, total)

    return NextResponse.json({
      data: transformedProjectStatuses,
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
  const { t } = await initLocale(request)
  try {
    const permError = await requirePermission(PERMISSIONS_GROUPED.LIST.CREATE)
    if (permError) return permError

    const body = await request.json()
    const validation = validateRequest(createProjectStatusSchema, body, t)
    if (validation.error) return validation.error
    const data = validation.data

    const projectStatus = await db.projectStatus.create({
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        color: data.color,
      },
    })

    return NextResponse.json(projectStatus, { status: 201 })
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
