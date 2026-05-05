import { PERMISSIONS } from "@/config"
import db from "@/lib/db"
import { Prisma } from "@/lib/generated/prisma/client"
import {
  convertToPrismaJsonValue,
  emptyToNull,
  initLocale,
  requirePermission,
  validateRequest,
  type DynamicRouteContext,
} from "@/utils"
import { createPublicProjectSchema } from "@/schemas/public-project"
import {
  publicProjectEditInclude,
  transformPublicProjectForEdit,
} from "@/prisma/public-projects"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(
  request: NextRequest,
  context: DynamicRouteContext<{ id: string }>
) {
  const { t } = await initLocale(request)

  try {
    const permError = await requirePermission(PERMISSIONS.WEBSITE_MANAGEMENT)
    if (permError) return permError

    const { id } = await context.params

    const project = await db.publicProject.findUnique({
      where: { id },
      include: publicProjectEditInclude,
    })

    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json({
      project: transformPublicProjectForEdit(project),
    })
  } catch (error) {
    console.error("Error fetching public project:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: DynamicRouteContext<{ id: string }>
) {
  const { t } = await initLocale(request)

  try {
    const permError = await requirePermission(PERMISSIONS.WEBSITE_MANAGEMENT)
    if (permError) return permError

    const { id } = await context.params

    const existing = await db.publicProject.findUnique({
      where: { id },
      include: {
        badge: { select: { id: true } },
        features: { select: { id: true } },
        categories: { select: { id: true } },
        attachments: { select: { id: true } },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const body = await request.json()
    const validation = validateRequest(createPublicProjectSchema, body, t)
    if (validation.error) return validation.error
    const data = validation.data

    if (data.isFeatured && !existing.isFeatured) {
      const featuredCount = await db.publicProject.count({
        where: { isFeatured: true },
      })
      if (featuredCount >= 2) {
        data.isFeatured = false
      }
    }

    const [city, project] = await Promise.all([
      db.city.findUnique({ where: { id: data.cityId }, select: { id: true } }),
      data.projectId
        ? db.project.findUnique({
            where: { id: data.projectId },
            select: { id: true },
          })
        : Promise.resolve(null),
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
      const attachments =
        data.attachments && data.attachments.length > 0
          ? data.attachments.map((attachment) => ({
              fileUrl: attachment.fileUrl,
              fileName: attachment.fileName || null,
              fileType: attachment.fileType || null,
              fileSize: attachment.fileSize || null,
              additionalInfo: convertToPrismaJsonValue(
                attachment.additionalInfo
              ),
            }))
          : []

      const updated = await db.$transaction(async (tx) => {
        // Delete old related records
        if (existing.attachments.length > 0) {
          await tx.publicProjectAttachment.deleteMany({
            where: { publicProjectId: id },
          })
        }

        // Disconnect old badges and features (many-to-many)
        const oldBadgeIds = existing.badge.map((b) => ({ id: b.id }))
        const oldFeatureIds = existing.features.map((f) => ({ id: f.id }))
        const oldCategoryIds = existing.categories.map((c) => ({ id: c.id }))

        // Update scalar fields + replace relations
        const result = await tx.publicProject.update({
          where: { id },
          data: {
            titleAr: data.titleAr.trim(),
            titleEn: data.titleEn.trim(),
            slug: data.slug.trim().toLowerCase(),
            descriptionAr: emptyToNull(data.descriptionAr ?? undefined),
            descriptionEn: emptyToNull(data.descriptionEn ?? undefined),
            shortDescriptionAr: emptyToNull(
              data.shortDescriptionAr ?? undefined
            ),
            shortDescriptionEn: emptyToNull(
              data.shortDescriptionEn ?? undefined
            ),
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
            ...(data.statusId ? { statusId: data.statusId } : {}),
            cityId: data.cityId,
            startingPrice: data.startingPrice ?? null,
            endingPrice: data.endingPrice ?? null,

            // Replace attachments
            attachments:
              attachments.length > 0 ? { create: attachments } : undefined,

            // Replace categories: disconnect old, connect new
            categories: {
              disconnect: oldCategoryIds,
              connect: data.categoryIds.map((cid) => ({ id: cid })),
            },

            // Replace badges: disconnect old, then create/connect new
            badge: {
              disconnect: oldBadgeIds,
              create: data.badges.map((b) => ({
                nameAr: b.nameAr.trim(),
                nameEn: b.nameEn.trim(),
                color: b.color.trim(),
              })),
            },

            // Replace features: disconnect old, then create/connect new
            features: {
              disconnect: oldFeatureIds,
              create: data.features.map((f) => ({
                labelAr: f.labelAr.trim(),
                labelEn: f.labelEn.trim(),
                valueAr: emptyToNull(f.valueAr),
                valueEn: emptyToNull(f.valueEn),
                icon: f.icon.trim(),
              })),
            },
          },
          include: publicProjectEditInclude,
        })

        return result
      })

      return NextResponse.json({
        project: transformPublicProjectForEdit(updated),
      })
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
    console.error("Error updating public project:", error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma error meta:", JSON.stringify(error.meta, null, 2))
    }
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: DynamicRouteContext<{ id: string }>
) {
  const { t } = await initLocale(request)
  try {
    // Check permission
    const permError = await requirePermission(PERMISSIONS.WEBSITE_MANAGEMENT)
    if (permError) return permError

    const { id } = await context.params

    // check for public project
    const project = await db.publicProject.findUnique({ where: { id } })
    if (!project) {
      return NextResponse.json(
        { error: t("errors.not_found") },
        { status: 404 }
      )
    }

    await db.publicProject.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting public project:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
