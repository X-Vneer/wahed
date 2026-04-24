import db from "@/lib/db"
import { initLocale } from "@/lib/helpers"
import { transformTaskStatus } from "@/prisma/task-statuses"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { locale, t } = await initLocale(request)
  try {
    const taskStatuses = await db.taskStatus.findMany({
      orderBy: [{ isSystem: "desc" }, { createdAt: "desc" }],
    })

    const transformedTaskStatuses = taskStatuses.map((taskStatus) =>
      transformTaskStatus(taskStatus, locale)
    )

    return NextResponse.json({
      data: transformedTaskStatuses,
      success: true,
      status: 200,
    })
  } catch (error) {
    console.error("Error fetching task statuses:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
