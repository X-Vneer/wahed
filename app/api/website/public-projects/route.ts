import { PERMISSIONS } from "@/config"
import db from "@/lib/db"
import { Prisma } from "@/lib/generated/prisma/client"
import { createPublicProjectSchema } from "@/lib/schemas/public-project"
import { transformZodError } from "@/lib/transform-errors"
import { getReqLocale } from "@/utils/get-req-locale"
import { hasPermission } from "@/utils/has-permission"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

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

function emptyToNull(s: string | undefined): string | null {
  if (s === undefined || s === null) return null
  const t = String(s).trim()
  return t.length ? t : null
}

export async function POST(request: NextRequest) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })

  try {
    const permissionCheck = await hasPermission(PERMISSIONS.WEBSITE_MANAGEMENT)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
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
          error: t("websiteCms.projects.publicProjectForm.errors.projectNotFound"),
          details: {
            projectId: t(
              "websiteCms.projects.publicProjectForm.errors.projectNotFound"
            ),
          },
        },
        { status: 404 }
      )
    }

    if (data.categoryIds.length > 0 && categories.length !== data.categoryIds.length) {
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

    try {
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
          attachments: buildPublicProjectAttachmentsForCreate(data.attachments),
          categories:
            data.categoryIds.length > 0
              ? {
                  connect: data.categoryIds.map((id) => ({ id })),
                }
              : undefined,
          badge:
            data.badges.length > 0
              ? {
                  create: data.badges.map((b) => ({
                    nameAr: b.nameAr.trim(),
                    nameEn: b.nameEn.trim(),
                    color: b.color.trim(),
                  })),
                }
              : undefined,
          features:
            data.features.length > 0
              ? {
                  create: data.features.map((f) => ({
                    labelAr: f.labelAr.trim(),
                    labelEn: f.labelEn.trim(),
                    valueAr: emptyToNull(f.valueAr),
                    valueEn: emptyToNull(f.valueEn),
                    icon: f.icon.trim(),
                  })),
                }
              : undefined,
        },
      })

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
              error: t("websiteCms.projects.publicProjectForm.errors.slugTaken"),
              details: {
                slug: t("websiteCms.projects.publicProjectForm.errors.slugTaken"),
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
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
