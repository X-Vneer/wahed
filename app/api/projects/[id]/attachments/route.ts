import db from "@/lib/db"
import { getAccessTokenPayload } from "@/lib/get-access-token"
import {
  createNotifications,
  getProjectStakeholderIds,
} from "@/lib/notifications"
import { type NextRequest, NextResponse } from "next/server"
import { PERMISSIONS_GROUPED } from "@/config"
import { Prisma } from "@/lib/generated/prisma/client"
import {
  initLocale,
  requirePermission,
  type DynamicRouteContext,
} from "@/lib/helpers"

export async function POST(
  request: NextRequest,
  context: DynamicRouteContext
) {
  const { t } = await initLocale(request)

  // Check permission
  const permError = await requirePermission(PERMISSIONS_GROUPED.PROJECT.UPDATE)
  if (permError) return permError

  try {
    const { id } = await context.params

    // Verify project exists
    const project = await db.project.findUnique({
      where: { id },
    })

    if (!project) {
      return NextResponse.json(
        { error: t("projects.errors.not_found") },
        { status: 404 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { attachments } = body

    if (!Array.isArray(attachments)) {
      return NextResponse.json(
        { error: t("projects.errors.invalid_attachments") },
        { status: 400 }
      )
    }

    // Get all existing attachments for this project
    const existingAttachments = await db.projectAttachment.findMany({
      where: { projectId: id },
      select: { id: true },
    })

    // Separate new attachments (without IDs) from existing ones (with IDs)
    const newAttachments = attachments.filter(
      (attachment: { id?: string }) => !attachment.id
    )
    const existingAttachmentIds = attachments
      .filter((attachment: { id?: string }) => attachment.id)
      .map((attachment: { id: string }) => attachment.id)

    // Find attachments to delete (existing ones not in the new list)
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

    // Create new attachments (ones without IDs)
    if (newAttachments.length > 0) {
      await db.projectAttachment.createMany({
        data: newAttachments.map(
          (attachment: {
            fileUrl: string
            fileName?: string
            fileType?: string
            fileSize?: number
            additionalInfo?: unknown
          }) => ({
            projectId: id,
            fileUrl: attachment.fileUrl,
            fileName: attachment.fileName || null,
            fileType: attachment.fileType || null,
            fileSize: attachment.fileSize || null,
            additionalInfo:
              attachment.additionalInfo !== undefined &&
              attachment.additionalInfo !== null
                ? (attachment.additionalInfo as Prisma.InputJsonValue)
                : Prisma.JsonNull,
          })
        ),
      })
    }

    // Fetch all attachments for the project to return in response
    const createdAttachments = await db.projectAttachment.findMany({
      where: { projectId: id },
    })

    // Notify project stakeholders about attachment changes
    const currentUser = await getAccessTokenPayload()
    getProjectStakeholderIds(id).then((stakeholderIds) => {
      const notifyIds = stakeholderIds.filter(
        (uid) => uid !== currentUser?.userId
      )
      if (notifyIds.length > 0) {
        createNotifications({
          userIds: notifyIds,
          type: "PROJECT_UPDATED",
          contentKey: "project_attachments_updated",
          messageParams: { projectName: project.nameEn || project.nameAr },
          relatedId: id,
          relatedType: "project",
        })
      }
    })

    return NextResponse.json(
      {
        message: t("projects.success.attachments_added"),
        attachments: createdAttachments,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error adding attachments:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
