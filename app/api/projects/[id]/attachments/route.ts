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

    // Append-only: only create rows without ids; never delete here.
    // Removals go through DELETE /api/projects/{id}/attachments/{attachmentId}.
    const newAttachments = attachments.filter(
      (attachment: { id?: string }) => !attachment.id
    ) as Array<{
      fileUrl: string
      fileName?: string
      fileType?: string
      fileSize?: number
      additionalInfo?: unknown
    }>

    if (newAttachments.length === 0) {
      return NextResponse.json(
        {
          message: t("projects.success.attachments_added"),
          attachments: [],
        },
        { status: 201 }
      )
    }

    const createdAttachments = await db.projectAttachment.createManyAndReturn({
      data: newAttachments.map((attachment) => ({
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
      })),
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
