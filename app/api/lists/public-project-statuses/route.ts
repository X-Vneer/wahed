import db from "@/lib/db"
import { initLocale } from "@/lib/helpers"
import { transformPublicProjectStatus } from "@/prisma/public-project-statuses"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { locale, t } = await initLocale(request)
  try {
    const rows = await db.publicProjectStatus.findMany({
      orderBy: [{ isSystem: "desc" }, { createdAt: "desc" }],
    })

    const transformed = rows.map((row) =>
      transformPublicProjectStatus(row, locale)
    )

    return NextResponse.json({
      data: transformed,
      success: true,
      status: 200,
    })
  } catch (error) {
    console.error("Error fetching public project statuses:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
