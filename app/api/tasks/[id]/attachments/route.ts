import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import { getAccessTokenPayload } from "@/lib/get-access-token"
import { Prisma } from "@/lib/generated/prisma/client"
import {
  DynamicRouteContext,
  initLocale,
  requirePermission,
} from "@/lib/helpers"
import {
  createNotifications,
  getTaskStakeholderIds,
} from "@/lib/notifications"
import { type NextRequest, NextResponse } from "next/server"

type AttachmentInput = {
  id?: string
  fileUrl: string
  fileName?: string
  fileType?: string
  fileSize?: number
  additionalInfo?: unknown
  isFinal?: boolean
}

export async function POST(
  request: NextRequest,
  context: DynamicRouteContext
) {
  const { t } = await initLocale(request)

  try {
    const permError = await requirePermission(PERMISSIONS_GROUPED.TASK.UPDATE)
    if (permError) return permError

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

    // Append-only: only create rows without ids; never delete here.
    // Removals go through DELETE /api/tasks/{id}/attachments/{attachmentId},
    // which also clears Task.finalFileId when needed.
    const newAttachments = attachments.filter(
      (attachment) => !attachment.id
    ) as AttachmentInput[]

    if (newAttachments.length === 0) {
      return NextResponse.json(
        { message: t("tasks.success.attachments_updated"), attachments: [] },
        { status: 201 }
      )
    }

    const createdAttachments = await db.taskAttachment.createManyAndReturn({
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

    // Set Task.finalFileId from first newly-flagged final, but only when
    // the task has no final yet — never clobber an existing final here.
    const firstFinalIndex = newAttachments.findIndex(
      (attachment) => attachment.isFinal === true
    )
    if (firstFinalIndex !== -1 && !task.finalFileId) {
      await db.task.update({
        where: { id: taskId },
        data: { finalFileId: createdAttachments[firstFinalIndex].id },
      })
    }

    // Notify task stakeholders about attachment changes
    const currentUser = await getAccessTokenPayload()
    const taskInfo = await db.task.findUnique({
      where: { id: taskId },
      select: { title: true },
    })
    getTaskStakeholderIds(taskId).then(({ creatorId, assigneeIds }) => {
      const allIds = [...new Set([creatorId, ...assigneeIds].filter(Boolean))]
      const notifyIds = allIds.filter(
        (uid) => uid !== currentUser?.userId
      ) as string[]
      if (notifyIds.length > 0) {
        createNotifications({
          userIds: notifyIds,
          type: "TASK_UPDATED",
          contentKey: "task_attachments_updated",
          messageParams: { taskTitle: taskInfo?.title ?? "" },
          relatedId: taskId,
          relatedType: "task",
        })
      }
    })

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

