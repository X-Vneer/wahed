import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import { getLocaleFromRequest } from "@/lib/i18n/utils"
import { taskInclude, transformTask } from "@/prisma/tasks"
import { getReqLocale } from "@/utils/get-req-locale"
import { hasPermission } from "@/utils/has-permission"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const permissionCheck = await hasPermission(PERMISSIONS_GROUPED.TASK.VIEW)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

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
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
