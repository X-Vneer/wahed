import { TASK_STATUS_ID_IN_PROGRESS, TASK_STATUS_ID_PENDING } from "@/config"
import db from "@/lib/db"
import { getAccessTokenPayload } from "@/lib/get-access-token"
import { taskInclude, transformTask } from "@/prisma/tasks"
import { getReqLocale } from "@/utils/get-req-locale"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })

    const payload = await getAccessTokenPayload()
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: t("errors.unauthorized") },
        { status: 401 }
      )
    }

    // First: in-progress tasks assigned to the current user
    const inProgressTask = await db.task.findFirst({
      where: {
        statusId: TASK_STATUS_ID_IN_PROGRESS,
        assignedTo: {
          some: { id: payload.userId },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      include: taskInclude,
    })

    const pendingTask = await db.task.findFirst({
      where: {
        statusId: TASK_STATUS_ID_PENDING,
        assignedTo: {
          some: { id: payload.userId },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      include: taskInclude,
    })

    const task = inProgressTask ?? pendingTask

    if (!task) {
      return NextResponse.json(null, {
        status: 200,
      })
    }

    return NextResponse.json(transformTask(task, locale))
  } catch (error) {
    console.error("Error fetching current user task:", error)
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
