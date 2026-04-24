import db from "@/lib/db"
import { getAccessTokenPayload } from "@/lib/get-access-token"
import {
  createNotifications,
  getProjectStakeholderIds,
} from "@/lib/notifications"
import { type NextRequest, NextResponse } from "next/server"
import { PERMISSIONS_GROUPED } from "@/config"
import {
  initLocale,
  requirePermission,
  type DynamicRouteContext,
} from "@/lib/helpers"

export async function PATCH(
  request: NextRequest,
  context: DynamicRouteContext
) {
  const { t } = await initLocale(request)

  try {
    const { id } = await context.params

    // Parse request body to check if we're archiving or unarchiving
    const body = await request.json().catch(() => ({}))
    const shouldArchive = body.archive !== false // Default to archive if not specified

    // Check permission based on action
    const permError = await requirePermission(
      shouldArchive
        ? PERMISSIONS_GROUPED.PROJECT.ARCHIVE
        : PERMISSIONS_GROUPED.PROJECT.UNARCHIVE
    )
    if (permError) return permError

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

    // Notify project stakeholders about archive/unarchive
    const currentUser = await getAccessTokenPayload()
    const projectInfo = await db.project.findUnique({
      where: { id },
      select: { nameEn: true, nameAr: true },
    })
    getProjectStakeholderIds(id).then((stakeholderIds) => {
      const notifyIds = stakeholderIds.filter(
        (uid) => uid !== currentUser?.userId
      )
      if (notifyIds.length > 0) {
        createNotifications({
          userIds: notifyIds,
          type: "PROJECT_UPDATED",
          contentKey: shouldArchive ? "project_archived" : "project_unarchived",
          messageParams: { projectName: projectInfo?.nameEn || projectInfo?.nameAr || "" },
          relatedId: id,
          relatedType: "project",
        })
      }
    })

    return NextResponse.json({
      id: updatedProject.id,
      archivedAt: updatedProject.archivedAt,
      archived: !!updatedProject.archivedAt,
    })
  } catch (error) {
    console.error("Error archiving/unarchiving project:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
