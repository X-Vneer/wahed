import { PERMISSIONS } from "@/config"
import db from "@/lib/db"
import { Prisma } from "@/lib/generated/prisma/client"
import { createPublicProjectSchema } from "@/lib/schemas/public-project"
import { transformZodError } from "@/lib/transform-errors"
import {
  publicProjectEditInclude,
  transformPublicProjectForEdit,
} from "@/prisma/public-projects"
import { getReqLocale } from "@/utils/get-req-locale"
import { hasPermission } from "@/utils/has-permission"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })

  try {
    const permissionCheck = await hasPermission(PERMISSIONS.WEBSITE_MANAGEMENT)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

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

/* ── helpers (shared with ../route.ts) ────────────────────────── */

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

function emptyToNull(s: string | undefined): string | null {
  if (s === undefined || s === null) return null
  const t = String(s).trim()
  return t.length ? t : null
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })

  try {
    const permissionCheck = await hasPermission(PERMISSIONS.WEBSITE_MANAGEMENT)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

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
    const validationResult = createPublicProjectSchema.safeParse(body)

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

    if (data.isFeatured && !existing.isFeatured) {
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
            status: data.status ?? undefined,
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

export async function DELETE(request: NextRequest, context: RouteContext) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })
  try {
    // Check permission
    const permissionCheck = await hasPermission(PERMISSIONS.WEBSITE_MANAGEMENT)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

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
