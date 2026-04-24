import { TASK_STATUS_ID_IN_PROGRESS, TASK_STATUS_ID_PENDING } from "@/config"
import db from "@/lib/db"
import { initLocale, requireAuth } from "@/lib/helpers"
import { taskInclude, transformTask } from "@/prisma/tasks"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { locale, t } = await initLocale(request)
  try {
    const auth = await requireAuth(t)
    if (auth.error) return auth.error
    const { payload } = auth

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
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
