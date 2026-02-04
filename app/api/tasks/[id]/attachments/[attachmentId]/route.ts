import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import { getReqLocale } from "@/utils/get-req-locale"
import { hasPermission } from "@/utils/has-permission"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

type RouteContext = {
  params: Promise<{
    id: string
    attachmentId: string
  }>
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })

    const permissionCheck = await hasPermission(PERMISSIONS_GROUPED.TASK.UPDATE)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    const { id: taskId, attachmentId } = await context.params

    // Ensure task exists and get its current final file
    const task = await db.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        finalFileId: true,
      },
    })

    if (!task) {
      return NextResponse.json(
        { error: t("tasks.errors.not_found") },
        { status: 404 }
      )
    }

    // Ensure attachment belongs to this task
    const attachment = await db.taskAttachment.findFirst({
      where: {
        id: attachmentId,
        taskId,
      },
      select: {
        id: true,
      },
    })

    if (!attachment) {
      return NextResponse.json(
        { error: t("tasks.errors.not_found") },
        { status: 404 }
      )
    }

    // Delete the attachment
    await db.taskAttachment.delete({
      where: { id: attachmentId },
    })

    // Clear final file reference if this attachment was the final file
    if (task.finalFileId === attachmentId) {
      await db.task.update({
        where: { id: taskId },
        data: {
          finalFileId: null,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting task attachment:", error)
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

