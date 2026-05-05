import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import { DynamicRouteContext, initLocale, requirePermission } from "@/utils"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(
  request: NextRequest,
  context: DynamicRouteContext<{ id: string; attachmentId: string }>
) {
  const { t } = await initLocale(request)
  try {
    const permError = await requirePermission(
      PERMISSIONS_GROUPED.PROJECT.UPDATE
    )
    if (permError) return permError

    const { id: projectId, attachmentId } = await context.params

    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    })

    if (!project) {
      return NextResponse.json(
        { error: t("projects.errors.not_found") },
        { status: 404 }
      )
    }

    const attachment = await db.projectAttachment.findFirst({
      where: { id: attachmentId, projectId },
      select: { id: true },
    })

    if (!attachment) {
      return NextResponse.json(
        { error: t("projects.errors.not_found") },
        { status: 404 }
      )
    }

    await db.projectAttachment.delete({
      where: { id: attachmentId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting project attachment:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
