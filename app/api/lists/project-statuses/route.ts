import db from "@/lib/db"
import { initLocale } from "@/utils"
import { transformProjectStatus } from "@/prisma/project-statuses"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { locale, t } = await initLocale(request)
  try {
    const projectStatuses = await db.projectStatus.findMany({
      orderBy: [{ isSystem: "desc" }, { createdAt: "desc" }],
    })

    const transformedProjectStatuses = projectStatuses.map((projectStatus) =>
      transformProjectStatus(projectStatus, locale)
    )

    return NextResponse.json({
      data: transformedProjectStatuses,
      success: true,
      status: 200,
    })
  } catch (error) {
    console.error("Error fetching project statuses:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
