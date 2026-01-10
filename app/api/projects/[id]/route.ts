import db from "@/lib/db"
import { createProjectSchema } from "@/lib/schemas/project"
import { transformZodError } from "@/lib/transform-errors"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"
import { hasPermission } from "@/utils/has-permission"
import { PERMISSIONS_GROUPED } from "@/config"
import { projectInclude, transformProject } from "@/prisma/projects"
import { getLocaleFromRequest } from "@/lib/i18n/utils"
import { getReqLocale } from "@/utils/get-req-locale"
import { Prisma } from "@/lib/generated/prisma/client"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // Check permission
    const permissionCheck = await hasPermission(
      PERMISSIONS_GROUPED.PROJECT.VIEW
    )
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    const { id } = await context.params

    // Fetch project with all relations
    const project = await db.project.findUnique({
      where: { id },
      include: projectInclude,
    })

    if (!project) {
      const locale = await getReqLocale(request)
      const t = await getTranslations({ locale })
      return NextResponse.json(
        { error: t("projects.errors.not_found") },
        { status: 404 }
      )
    }

    const locale = getLocaleFromRequest(request)
    const transformedProject = transformProject(project, locale)

    return NextResponse.json(transformedProject)
  } catch (error) {
    console.error("Error fetching project:", error)
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    // Check permission
    const permissionCheck = await hasPermission(
      PERMISSIONS_GROUPED.PROJECT.UPDATE
    )
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    // Get translations based on request locale
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })

    const { id } = await context.params

    // Check if project exists
    const existingProject = await db.project.findUnique({
      where: { id },
      include: projectInclude,
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: t("projects.errors.not_found") },
        { status: 404 }
      )
    }

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

    // Check if city exists
    const city = await db.city.findUnique({
      where: { id: data.cityId },
    })

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

    // Check if categories exist (if provided)
    if (data.categoryIds && data.categoryIds.length > 0) {
      const categories = await db.projectCategory.findMany({
        where: {
          id: { in: data.categoryIds },
          isActive: true,
        },
      })

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

    // Update project with categories, attachments, and additional data
    const project = await db.project.update({
      where: { id },
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
                set: data.categoryIds.map((id: string) => ({ id })),
              }
            : { set: [] }, // Clear categories if none provided
        // Handle attachments - delete existing and create new ones
        attachments: {
          deleteMany: {}, // Delete all existing attachments
          create:
            data.attachments && data.attachments.length > 0
              ? data.attachments.map((attachment) => ({
                  fileUrl: attachment.fileUrl,
                  fileName: attachment.fileName || null,
                  fileType: attachment.fileType || null,
                  fileSize: attachment.fileSize || null,
                  additionalInfo: attachment.additionalInfo || null,
                }))
              : [],
        },
        // Handle additional data - delete existing and create new ones
        additionalData: {
          deleteMany: {}, // Delete all existing additional data
          create:
            data.additionalFields && data.additionalFields.length > 0
              ? data.additionalFields.map((field) => {
                  // Convert value to proper JSON format
                  let jsonValue:
                    | Prisma.InputJsonValue
                    | Prisma.JsonNullValueInput = Prisma.JsonNull
                  if (field.value !== undefined && field.value !== null) {
                    if (typeof field.value === "string") {
                      const trimmed = field.value.trim()
                      jsonValue = trimmed || Prisma.JsonNull
                    } else if (Array.isArray(field.value)) {
                      jsonValue = field.value
                    } else {
                      jsonValue = field.value as Prisma.InputJsonValue
                    }
                  }

                  return {
                    name: field.label,
                    value: jsonValue,
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
                  }
                })
              : [],
        },
      },
      include: projectInclude,
    })

    const transformedProject = transformProject(project, locale)

    return NextResponse.json(transformedProject)
  } catch (error) {
    console.error("Error updating project:", error)
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
