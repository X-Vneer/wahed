import db from "@/lib/db"
import { getAccessTokenPayload } from "@/lib/get-access-token"
import { createProjectSchema } from "@/schemas/project"
import { type NextRequest, NextResponse } from "next/server"
import { PERMISSIONS_GROUPED } from "@/config"
import {
  createNotifications,
  getProjectStakeholderIds,
} from "@/lib/notifications"
import { projectInclude, transformProject } from "@/prisma/projects"
import { getLocaleFromRequest } from "@/lib/i18n/utils"
import { Prisma } from "@/lib/generated/prisma/client"
import { NotificationCategory } from "@/lib/generated/prisma/enums"
import {
  convertToPrismaJsonValue,
  initLocale,
  requirePermission,
  validateRequest,
  type DynamicRouteContext,
} from "@/lib/helpers"

type AttachmentWithOptionalId = {
  id?: string
  fileUrl: string
  fileName?: string
  fileType?: string
  fileSize?: number
  additionalInfo?: unknown
}

// Helper function to handle attachment updates
async function updateAttachments(
  projectId: string,
  attachments: AttachmentWithOptionalId[] | undefined
) {
  if (attachments === undefined) {
    return
  }

  // Get existing attachments
  const existingAttachments = await db.projectAttachment.findMany({
    where: { projectId },
    select: { id: true },
  })

  // Separate new and existing attachments
  const newAttachments = attachments.filter((a) => !a.id)
  const existingAttachmentIds = attachments
    .filter((a) => a.id)
    .map((a) => a.id as string)

  // Find attachments to delete
  const attachmentsToDelete = existingAttachments.filter(
    (existing) => !existingAttachmentIds.includes(existing.id)
  )

  // Delete removed attachments
  if (attachmentsToDelete.length > 0) {
    await db.projectAttachment.deleteMany({
      where: {
        id: { in: attachmentsToDelete.map((a) => a.id) },
      },
    })
  }

  // Create new attachments
  if (newAttachments.length > 0) {
    await db.projectAttachment.createMany({
      data: newAttachments.map((attachment) => ({
        projectId,
        fileUrl: attachment.fileUrl,
        fileName: attachment.fileName || null,
        fileType: attachment.fileType || null,
        fileSize: attachment.fileSize || null,
        additionalInfo: convertToPrismaJsonValue(attachment.additionalInfo),
      })),
    })
  }
}

// Helper function to build additional data for update
function buildAdditionalData(
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
    return {
      deleteMany: {},
      create: [],
    }
  }

  return {
    deleteMany: {},
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

export async function GET(request: NextRequest, context: DynamicRouteContext) {
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

    const { id } = await context.params

    // Fetch project with all relations
    const project = await db.project.findUnique({
      where: { id },
      include: projectInclude,
    })

    if (!project) {
      return NextResponse.json(
        { error: t("projects.errors.not_found") },
        { status: 404 }
      )
    }

    const locale = getLocaleFromRequest(request)
    const currentUser = { userId: payload.userId, role: payload.role }
    const transformedProject = transformProject(project, locale, currentUser)

    return NextResponse.json(transformedProject)
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: DynamicRouteContext) {
  const { locale, t } = await initLocale(request)

  // Check permission
  const permError = await requirePermission(PERMISSIONS_GROUPED.PROJECT.UPDATE)
  if (permError) return permError

  try {
    const { id } = await context.params

    // Check if project exists (optimized - only check existence, not full data)
    const projectExists = await db.project.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!projectExists) {
      return NextResponse.json(
        { error: t("projects.errors.not_found") },
        { status: 404 }
      )
    }

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

    // Handle attachments update
    await updateAttachments(
      id,
      data.attachments as AttachmentWithOptionalId[] | undefined
    )

    // Update project with categories and additional data
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
        startDate: data.startDate ?? null,
        googleMapsAddress: data.googleMapsAddress || null,
        cityId: data.cityId,
        ...(data.statusId ? { statusId: data.statusId } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        categories:
          data.categoryIds && data.categoryIds.length > 0
            ? {
                set: data.categoryIds.map((categoryId: string) => ({
                  id: categoryId,
                })),
              }
            : { set: [] },
        additionalData: buildAdditionalData(data.additionalFields),
      },
      include: projectInclude,
    })

    const transformedProject = transformProject(project, locale)

    // Notify users working on this project's tasks
    const currentUser = await getAccessTokenPayload()
    getProjectStakeholderIds(id).then((stakeholderIds) => {
      const notifyIds = stakeholderIds.filter(
        (uid) => uid !== currentUser?.userId
      )
      if (notifyIds.length > 0) {
        createNotifications({
          userIds: notifyIds,
          category: NotificationCategory.PROJECT_UPDATED,
          messageParams: { projectName: data.nameEn || data.nameAr },
          relatedId: id,
          relatedType: "project",
        })
      }
    })

    return NextResponse.json(transformedProject)
  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: DynamicRouteContext
) {
  const { t } = await initLocale(request)

  // Check permission
  const permError = await requirePermission(PERMISSIONS_GROUPED.PROJECT.DELETE)
  if (permError) return permError

  try {
    const { id } = await context.params

    // Check if project exists
    const existingProject = await db.project.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: t("projects.errors.not_found") },
        { status: 404 }
      )
    }

    // Delete project (cascade will handle related records)
    await db.project.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
