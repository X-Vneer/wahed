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
    })
  } catch (error) {
    console.error("Error fetching projects:", error)
    const t = await getTranslations()
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
    const t = await getTranslations()

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
                connect: data.categoryIds.map((id: string) => ({ id })),
              }
            : undefined,
        attachments:
          data.attachments && data.attachments.length > 0
            ? {
                create: data.attachments.map((attachment) => ({
                  fileUrl: attachment.fileUrl,
                  fileName: attachment.fileName || null,
                  fileType: attachment.fileType || null,
                  fileSize: attachment.fileSize || null,
                  additionalInfo: attachment.additionalInfo || null,
                })),
              }
            : undefined,
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)
    const t = await getTranslations()
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
