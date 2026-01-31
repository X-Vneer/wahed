import db from "@/lib/db"
import { transformTaskStatus } from "@/prisma/task-statuses"
import { getReqLocale } from "@/utils/get-req-locale"
import { getTranslations } from "next-intl/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })
  try {
    const taskStatuses = await db.taskStatus.findMany({
      orderBy: {
        createdAt: "desc",
      },
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
