import { PERMISSIONS, PROJECT_STATUS_ID_PLANNING } from "@/config"
import db from "@/lib/db"
import { Prisma } from "@/lib/generated/prisma/client"
import {
  convertToPrismaJsonValue,
  emptyToNull,
  initLocale,
  requirePermission,
  validateRequest,
} from "@/lib/helpers"
import { createPublicProjectSchema } from "@/lib/schemas/public-project"
import {
  publicProjectInclude,
  transformPublicProject,
} from "@/prisma/public-projects"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { locale, t } = await initLocale(request)

  try {
    const permError = await requirePermission(PERMISSIONS.WEBSITE_MANAGEMENT)
    if (permError) return permError

    const raw = await db.publicProject.findMany({
      orderBy: { createdAt: "desc" },
      include: publicProjectInclude,
    })

    const projects = raw.map((p) => transformPublicProject(p, locale))

    return NextResponse.json({ projects })
  } catch (error) {
    console.error("Error fetching public projects:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

function buildPublicProjectAttachmentsForCreate(
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

export async function POST(request: NextRequest) {
  const { t } = await initLocale(request)

  try {
    const permError = await requirePermission(PERMISSIONS.WEBSITE_MANAGEMENT)
    if (permError) return permError

    const body = await request.json()
    const validation = validateRequest(createPublicProjectSchema, body, t)
    if (validation.error) return validation.error
    const data = validation.data

    if (data.isFeatured) {
      const featuredCount = await db.publicProject.count({
        where: { isFeatured: true },
      })
      if (featuredCount >= 2) {
        data.isFeatured = false
      }
    }

    const [city, project, categories] = await Promise.all([
      db.city.findUnique({ where: { id: data.cityId }, select: { id: true } }),
      data.projectId
        ? db.project.findUnique({
            where: { id: data.projectId },
            select: { id: true },
          })
        : Promise.resolve(null),
      data.categoryIds.length > 0
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
          details: { cityId: t("projects.errors.city_not_found") },
        },
        { status: 404 }
      )
    }

    if (data.projectId && !project) {
      return NextResponse.json(
        {
          error: t(
            "websiteCms.projects.publicProjectForm.errors.projectNotFound"
          ),
          details: {
            projectId: t(
              "websiteCms.projects.publicProjectForm.errors.projectNotFound"
            ),
          },
        },
        { status: 404 }
      )
    }

    try {
      // Step 1: Create the public project with scalar fields only
      const created = await db.publicProject.create({
        data: {
          titleAr: data.titleAr.trim(),
          titleEn: data.titleEn.trim(),
          slug: data.slug.trim().toLowerCase(),
          descriptionAr: emptyToNull(data.descriptionAr ?? undefined),
          descriptionEn: emptyToNull(data.descriptionEn ?? undefined),
          shortDescriptionAr: emptyToNull(data.shortDescriptionAr ?? undefined),
          shortDescriptionEn: emptyToNull(data.shortDescriptionEn ?? undefined),
          images: data.images ?? [],
          isActive: data.isActive ?? true,
          isFeatured: data.isFeatured ?? false,
          projectGuide: emptyToNull(data.projectGuide ?? undefined),
          projectId: data.projectId ?? null,
          locationAr: emptyToNull(data.locationAr ?? undefined),
          locationEn: emptyToNull(data.locationEn ?? undefined),
          area: data.area ?? null,
          deedNumber: emptyToNull(data.deedNumber ?? undefined),
          googleMapsAddress: emptyToNull(data.googleMapsAddress ?? undefined),
          statusId: data.statusId ?? PROJECT_STATUS_ID_PLANNING,
          cityId: data.cityId,
          startingPrice: data.startingPrice ?? null,
          endingPrice: data.endingPrice ?? null,
          attachments: buildPublicProjectAttachmentsForCreate(data.attachments),
        },
      })

      // Step 2: Connect categories
      if (data.categoryIds.length > 0) {
        await db.publicProject.update({
          where: { id: created.id },
          data: {
            categories: {
              connect: data.categoryIds.map((id) => ({ id })),
            },
          },
        })
      }

      // Step 3: Create badges
      if (data.badges.length > 0) {
        await db.publicProject.update({
          where: { id: created.id },
          data: {
            badge: {
              create: data.badges.map((b) => ({
                nameAr: b.nameAr.trim(),
                nameEn: b.nameEn.trim(),
                color: b.color.trim(),
              })),
            },
          },
        })
      }

      // Step 4: Create features
      if (data.features.length > 0) {
        await db.publicProject.update({
          where: { id: created.id },
          data: {
            features: {
              create: data.features.map((f) => ({
                labelAr: f.labelAr.trim(),
                labelEn: f.labelEn.trim(),
                valueAr: emptyToNull(f.valueAr),
                valueEn: emptyToNull(f.valueEn),
                icon: f.icon.trim(),
              })),
            },
          },
        })
      }

      return NextResponse.json(created, { status: 201 })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const target = (error.meta?.target as string[] | undefined)?.join(", ")
        if (target?.includes("slug")) {
          return NextResponse.json(
            {
              error: t(
                "websiteCms.projects.publicProjectForm.errors.slugTaken"
              ),
              details: {
                slug: t(
                  "websiteCms.projects.publicProjectForm.errors.slugTaken"
                ),
              },
            },
            { status: 409 }
          )
        }
        throw error
      }
      throw error
    }
  } catch (error) {
    console.error("Error creating public project:", error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma error meta:", JSON.stringify(error.meta, null, 2))
    }
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
