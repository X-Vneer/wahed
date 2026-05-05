import db from "@/lib/db"
import { taskInclude } from "@/prisma/tasks"
import { getLocaleFromRequest } from "@/lib/i18n/utils"
import { type NextRequest, NextResponse } from "next/server"
import { PERMISSIONS_GROUPED } from "@/config"
import { transformTask } from "@/prisma/tasks"
import {
  buildVisibleTaskFilter,
  initLocale,
  requireAuth,
  requirePermission,
  type DynamicRouteContext,
} from "@/utils"

export async function GET(request: NextRequest, context: DynamicRouteContext) {
  const { t } = await initLocale(request)

  const permError = await requirePermission(PERMISSIONS_GROUPED.TASK.VIEW)
  if (permError) return permError

  const auth = await requireAuth(t)
  if (auth.error) return auth.error
  const { payload } = auth

  try {
    const { id: projectId } = await context.params

    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { id: true, nameAr: true, nameEn: true },
    })

    if (!project) {
      return NextResponse.json(
        { error: t("projects.errors.not_found") },
        { status: 404 }
      )
    }

    const tasks = await db.task.findMany({
      where: {
        projectId,
        ...buildVisibleTaskFilter({
          userId: payload.userId,
          role: payload.role,
        }),
      },
      include: taskInclude,
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    })

    const locale = getLocaleFromRequest(request)
    const projectName = locale === "ar" ? project.nameAr : project.nameEn

    return NextResponse.json({
      project: { id: project.id, name: projectName },
      tasks: tasks.map((task) => transformTask(task, locale)),
    })
  } catch (error) {
    console.error("Error fetching project tasks:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
