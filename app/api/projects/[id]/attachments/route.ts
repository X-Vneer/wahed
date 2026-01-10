import db from "@/lib/db"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"
import { hasPermission } from "@/utils/has-permission"
import { PERMISSIONS_GROUPED } from "@/config"
import { getReqLocale } from "@/utils/get-req-locale"
import { Prisma } from "@/lib/generated/prisma/client"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })
  try {
    const { id } = await context.params

    // Check permission
    const permissionCheck = await hasPermission(
      PERMISSIONS_GROUPED.PROJECT.UPDATE
    )
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

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
    const createdAttachments = await Promise.all(
      newAttachments.map(
        (attachment: {
          fileUrl: string
          fileName?: string
          fileType?: string
          fileSize?: number
          additionalInfo?: unknown
        }) =>
          db.projectAttachment.create({
            data: {
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
            },
          })
      )
    )

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
