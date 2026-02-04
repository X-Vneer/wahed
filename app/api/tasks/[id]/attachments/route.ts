import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import { Prisma } from "@/lib/generated/prisma/client"
import { getReqLocale } from "@/utils/get-req-locale"
import { hasPermission } from "@/utils/has-permission"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

type AttachmentInput = {
  id?: string
  fileUrl: string
  fileName?: string
  fileType?: string
  fileSize?: number
  additionalInfo?: unknown
  isFinal?: boolean
}

export async function POST(request: NextRequest, context: RouteContext) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })

  try {
    const permissionCheck = await hasPermission(PERMISSIONS_GROUPED.TASK.UPDATE)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    const { id: taskId } = await context.params

    // Verify task exists
    const task = await db.task.findUnique({
      where: { id: taskId },
      select: { id: true, finalFileId: true },
    })

    if (!task) {
      return NextResponse.json(
        { error: t("tasks.errors.not_found") },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { attachments } = body as { attachments?: AttachmentInput[] }

    if (!Array.isArray(attachments)) {
      return NextResponse.json(
        { error: t("tasks.errors.invalid_attachments") },
        { status: 400 }
      )
    }

    // Get all existing attachments for this task
    const existingAttachments = await db.taskAttachment.findMany({
      where: { taskId },
      select: { id: true },
    })

    // Separate new attachments (without IDs) from existing ones (with IDs)
    const newAttachments = attachments.filter(
      (attachment) => !attachment.id
    ) as AttachmentInput[]

    const existingAttachmentIds = attachments
      .filter((attachment): attachment is Required<Pick<AttachmentInput, "id">> &
        AttachmentInput => !!attachment.id)
      .map((attachment) => attachment.id)

    // Find attachments to delete (existing ones not in the new list)
    const attachmentsToDelete = existingAttachments.filter(
      (existing) => !existingAttachmentIds.includes(existing.id)
    )

    let shouldClearFinalFile = false

    if (
      task.finalFileId &&
      attachmentsToDelete.some((a) => a.id === task.finalFileId)
    ) {
      shouldClearFinalFile = true
    }

    // Delete removed attachments
    if (attachmentsToDelete.length > 0) {
      await db.taskAttachment.deleteMany({
        where: {
          id: { in: attachmentsToDelete.map((a) => a.id) },
        },
      })
    }

    // Create new attachments (ones without IDs)
    if (newAttachments.length > 0) {
      await db.taskAttachment.createMany({
        data: newAttachments.map((attachment) => ({
          taskId,
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
    }

    // Fetch all attachments for the task to return in response
    const createdAttachments = await db.taskAttachment.findMany({
      where: { taskId },
    })

    // Determine final file (if any)
    const finalCandidates = attachments.filter(
      (attachment) => attachment.isFinal === true
    )

    if (finalCandidates.length > 1) {
      return NextResponse.json(
        { error: t("tasks.errors.invalid_final_file") },
        { status: 400 }
      )
    }

    let finalFileId: string | null | undefined = undefined

    if (finalCandidates.length === 1) {
      const candidate = finalCandidates[0]

      if (candidate.id) {
        const exists = createdAttachments.some(
          (attachment) => attachment.id === candidate.id
        )

        if (!exists) {
          return NextResponse.json(
            { error: t("tasks.errors.invalid_final_file") },
            { status: 400 }
          )
        }

        finalFileId = candidate.id
      } else {
        const match = createdAttachments.find(
          (attachment) =>
            attachment.fileUrl === candidate.fileUrl &&
            (attachment.fileName ?? null) === (candidate.fileName ?? null)
        )

        if (!match) {
          return NextResponse.json(
            { error: t("tasks.errors.invalid_final_file") },
            { status: 400 }
          )
        }

        finalFileId = match.id
      }
    } else if (shouldClearFinalFile) {
      // No final candidate but the previous final file was removed
      finalFileId = null
    }

    if (finalFileId !== undefined) {
      await db.task.update({
        where: { id: taskId },
        data: { finalFileId },
      })
    }

    return NextResponse.json(
      {
        message: t("tasks.success.attachments_updated"),
        attachments: createdAttachments,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error adding task attachments:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

