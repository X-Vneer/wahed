import db from "@/lib/db"
import { createProjectSchema } from "@/lib/schemas/project"
import { transformZodError } from "@/lib/transform-errors"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"
import { hasPermission } from "@/utils/has-permission"
import { PERMISSIONS_GROUPED } from "@/config"
import { projectInclude } from "@/prisma/projects"
import { ProjectStatus } from "@/lib/generated/prisma/enums"
import { transformProject } from "@/prisma/projects"
import { getLocaleFromRequest } from "@/lib/i18n/utils"
import { getReqLocale } from "@/utils/get-req-locale"
import { Prisma } from "@/lib/generated/prisma/client"

// Helper function to convert additional field value to Prisma JSON format
function convertToPrismaJsonValue(
  value: unknown
): Prisma.InputJsonValue | Prisma.JsonNullValueInput {
  if (value === undefined || value === null) {
    return Prisma.JsonNull
  }
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed || Prisma.JsonNull
  }
  if (Array.isArray(value)) {
    return value
  }
  return value as Prisma.InputJsonValue
}

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
  // Check permission
  const permissionCheck = await hasPermission(PERMISSIONS_GROUPED.PROJECT.VIEW)
  if (!permissionCheck.hasPermission) {
    return permissionCheck.error!
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const isActive = searchParams.get("archived")

    const [total, archived] = await Promise.all([
      db.project.count({
        where: {
          archivedAt: null,
          ...(status ? { status: status as ProjectStatus } : {}),
        },
      }),

      db.project.count({
        where: {
          archivedAt: { not: null },
          ...(status ? { status: status as ProjectStatus } : {}),
        },
      }),
    ])

    const projects = await db.project.findMany({
      include: projectInclude,
      where: {
        archivedAt: isActive == "true" ? { not: null } : null,
        ...(status ? { status: status as ProjectStatus } : {}),
      },
    })

    const locale = getLocaleFromRequest(request)
    const transformedProjects = projects.map((project) =>
      transformProject(project, locale)
    )
    return NextResponse.json({
      projects: transformedProjects,
      total,
      archived,
      totalTasks: 100,
    })
  } catch (error) {
    console.error("Error fetching projects:", error)
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await hasPermission(
      PERMISSIONS_GROUPED.PROJECT.CREATE
    )
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    // Get translations based on request locale
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createProjectSchema.safeParse(body)

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
        googleMapsAddress: data.googleMapsAddress || null,
        cityId: data.cityId,
        ...(data.status ? { status: data.status } : {}),
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

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
