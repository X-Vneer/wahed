import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import { initLocale, requirePermission } from "@/lib/helpers"
import { getLocaleFromRequest } from "@/lib/i18n/utils"
import { taskInclude, transformTask } from "@/prisma/tasks"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { t } = await initLocale(request)
  try {
    const permError = await requirePermission(PERMISSIONS_GROUPED.TASK.VIEW)
    if (permError) return permError

    const tasks = await db.task.findMany({
      where: { projectId: null },
      include: taskInclude,
      orderBy: [{ createdAt: "desc" }],
    })

    const locale = getLocaleFromRequest(request)

    return NextResponse.json({
      tasks: tasks.map((task) => transformTask(task, locale)),
    })
  } catch (error) {
    console.error("Error fetching general tasks:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
