import db from "@/lib/db"
import { getAccessTokenPayload } from "@/lib/get-access-token"
import { createProjectSchema } from "@/lib/schemas/project"
import { type NextRequest, NextResponse } from "next/server"
import { PERMISSIONS_GROUPED, PROJECT_STATUS_ID_PLANNING } from "@/config"
import { createNotifications, getAdminUserIds } from "@/lib/notifications"
import { projectInclude } from "@/prisma/projects"
import { transformProject } from "@/prisma/projects"
import { getLocaleFromRequest } from "@/lib/i18n/utils"
import { Prisma } from "@/lib/generated/prisma/client"
import {
  convertToPrismaJsonValue,
  initLocale,
  requirePermission,
  validateRequest,
} from "@/lib/helpers"

// Helper function to build attachments for create
function buildAttachmentsForCreate(
  attachments:
    | Array<{
        fileUrl: string
        fileName?: string
        fileType?: string
        fileSize?: number
        additionalInfo?: unknown
      }>
    | undefined
) {
  if (!attachments || attachments.length === 0) {
    return undefined
  }

  return {
    create: attachments.map((attachment) => ({
      fileUrl: attachment.fileUrl,
      fileName: attachment.fileName || null,
      fileType: attachment.fileType || null,
      fileSize: attachment.fileSize || null,
      additionalInfo: convertToPrismaJsonValue(attachment.additionalInfo),
    })),
  }
}

// Helper function to build additional data for create
function buildAdditionalDataForCreate(
  additionalFields:
    | Array<{
        label: string
        type: string
        value?: unknown
        options?: string[]
        min?: number
        max?: number
        minDate?: Date
        maxDate?: Date
        placeholder?: string
        required?: boolean
      }>
    | undefined
) {
  if (!additionalFields || additionalFields.length === 0) {
    return undefined
  }

  return {
    create: additionalFields.map((field) => ({
      name: field.label,
      value: convertToPrismaJsonValue(field.value),
      type: field.type,
      options:
        field.options && field.options.length > 0
          ? (field.options as Prisma.InputJsonValue)
          : undefined,
      min: field.min ?? undefined,
      max: field.max ?? undefined,
      minDate: field.minDate ?? undefined,
      maxDate: field.maxDate ?? undefined,
      placeholder: field.placeholder ?? undefined,
      required: field.required ?? false,
    })),
  }
}

export async function GET(request: NextRequest) {
  const { t } = await initLocale(request)

  // Check permission
  const permError = await requirePermission(PERMISSIONS_GROUPED.PROJECT.VIEW)
  if (permError) return permError

  try {
    const payload = await getAccessTokenPayload()
    if (!payload) {
      return NextResponse.json(
        { error: t("errors.unauthorized") },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const statusId = searchParams.get("statusId")
    const isActive = searchParams.get("archived")

    const [total, archived, totalTasks] = await Promise.all([
      db.project.count({
        where: {
          archivedAt: null,
          ...(statusId ? { statusId } : {}),
        },
      }),

      db.project.count({
        where: {
          archivedAt: { not: null },
          ...(statusId ? { statusId } : {}),
        },
      }),
      db.task.count(),
    ])

    const projects = await db.project.findMany({
      include: projectInclude,
      where: {
        archivedAt: isActive == "true" ? { not: null } : null,
        ...(statusId ? { statusId } : {}),
      },
    })

    const locale = getLocaleFromRequest(request)
    const currentUser = { userId: payload.userId, role: payload.role }
    const transformedProjects = projects.map((project) =>
      transformProject(project, locale, currentUser)
    )
    return NextResponse.json({
      projects: transformedProjects,
      total,
      archived,
      totalTasks,
    })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const { t } = await initLocale(request)

  // Check permission
  const permError = await requirePermission(PERMISSIONS_GROUPED.PROJECT.CREATE)
  if (permError) return permError

  try {
    // Parse and validate request body
    const body = await request.json()
    const validation = validateRequest(createProjectSchema, body, t)
    if (validation.error) return validation.error
    const data = validation.data

    // Validate city and categories in parallel for better performance
    const [city, categories] = await Promise.all([
      db.city.findUnique({
        where: { id: data.cityId },
        select: { id: true },
      }),
      data.categoryIds && data.categoryIds.length > 0
        ? db.projectCategory.findMany({
            where: {
              id: { in: data.categoryIds },
              isActive: true,
            },
            select: { id: true },
          })
        : Promise.resolve([]),
    ])

    if (!city) {
      return NextResponse.json(
        {
          error: t("projects.errors.city_not_found"),
          details: {
            cityId: t("projects.errors.city_not_found"),
          },
        },
        { status: 404 }
      )
    }

    // Validate categories if provided
    if (data.categoryIds && data.categoryIds.length > 0) {
      if (categories.length !== data.categoryIds.length) {
        return NextResponse.json(
          {
            error: t("projects.errors.invalid_categories"),
            details: {
              categoryIds: t("projects.errors.invalid_categories"),
            },
          },
          { status: 400 }
        )
      }
    }

    // Create project with categories and attachments
    const project = await db.project.create({
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        image: data.image || null,
        descriptionAr: data.descriptionAr || null,
        descriptionEn: data.descriptionEn || null,
        area: data.area || null,
        numberOfFloors: data.numberOfFloors || null,
        deedNumber: data.deedNumber || null,
        workDuration: data.workDuration || null,
        startDate: data.startDate ?? null,
        googleMapsAddress: data.googleMapsAddress || null,
        cityId: data.cityId,
        statusId: data.statusId ?? PROJECT_STATUS_ID_PLANNING,
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        categories:
          data.categoryIds && data.categoryIds.length > 0
            ? {
                connect: data.categoryIds.map((categoryId: string) => ({
                  id: categoryId,
                })),
              }
            : undefined,
        attachments: buildAttachmentsForCreate(data.attachments),
        additionalData: buildAdditionalDataForCreate(data.additionalFields),
      },
    })

    // Notify admins about new project
    const currentUser = await getAccessTokenPayload()
    getAdminUserIds().then((adminIds) => {
      const ids = adminIds.filter((id) => id !== currentUser?.userId)
      if (ids.length > 0) {
        createNotifications({
          userIds: ids,
          type: "PROJECT_CREATED",
          contentKey: "project_created",
          messageParams: { projectName: data.nameEn || data.nameAr },
          relatedId: project.id,
          relatedType: "project",
        })
      }
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
