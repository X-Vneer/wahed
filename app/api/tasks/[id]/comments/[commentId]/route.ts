import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import { DynamicRouteContext, initLocale, requirePermission } from "@/utils"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(
  request: NextRequest,
  context: DynamicRouteContext<{ id: string; commentId: string }>
) {
  const { t } = await initLocale(request)
  try {
    const permError = await requirePermission(PERMISSIONS_GROUPED.TASK.UPDATE)
    if (permError) return permError

    const { id: taskId, commentId } = await context.params

    const existing = await db.taskComment.findFirst({
      where: { id: commentId, taskId },
      select: { id: true },
    })

    if (!existing) {
      return NextResponse.json(
        { error: t("tasks.errors.comment_not_found") },
        { status: 404 }
      )
    }

    await db.taskComment.delete({
      where: { id: commentId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting task comment:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
