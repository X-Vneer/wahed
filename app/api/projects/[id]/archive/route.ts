import db from "@/lib/db"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"
import { hasPermission } from "@/utils/has-permission"
import { PERMISSIONS_GROUPED } from "@/config"
import { getReqLocale } from "@/utils/get-req-locale"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })

    // Parse request body to check if we're archiving or unarchiving
    const body = await request.json().catch(() => ({}))
    const shouldArchive = body.archive !== false // Default to archive if not specified

    // Check permission based on action
    const permissionCheck = await hasPermission(
      shouldArchive
        ? PERMISSIONS_GROUPED.PROJECT.ARCHIVE
        : PERMISSIONS_GROUPED.PROJECT.UNARCHIVE
    )
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    // Check if project exists
    const project = await db.project.findUnique({
      where: { id },
      select: { id: true, archivedAt: true },
    })

    if (!project) {
      return NextResponse.json(
        { error: t("projects.errors.not_found") },
        { status: 404 }
      )
    }

    // Update project archive status
    const updatedProject = await db.project.update({
      where: { id },
      data: {
        archivedAt: shouldArchive ? new Date() : null,
      },
      select: {
        id: true,
        archivedAt: true,
      },
    })

    return NextResponse.json({
      id: updatedProject.id,
      archivedAt: updatedProject.archivedAt,
      archived: !!updatedProject.archivedAt,
    })
  } catch (error) {
    console.error("Error archiving/unarchiving project:", error)
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
