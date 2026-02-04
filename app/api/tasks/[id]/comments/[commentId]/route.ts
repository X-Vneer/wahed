import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import { getReqLocale } from "@/utils/get-req-locale"
import { hasPermission } from "@/utils/has-permission"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

type RouteContext = {
  params: Promise<{ id: string; commentId: string }>
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })
    const permissionCheck = await hasPermission(PERMISSIONS_GROUPED.TASK.UPDATE)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

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
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

