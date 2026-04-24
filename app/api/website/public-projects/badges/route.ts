import { PERMISSIONS } from "@/config"
import db from "@/lib/db"
import { initLocale, requirePermission } from "@/lib/helpers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(_request: NextRequest) {
  const { t } = await initLocale(_request)

  try {
    const permError = await requirePermission(PERMISSIONS.WEBSITE_MANAGEMENT)
    if (permError) return permError

    const badges = await db.publicProjectBadge.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        nameAr: true,
        nameEn: true,
        color: true,
      },
    })

    return NextResponse.json({ data: badges })
  } catch (error) {
    console.error("Error listing public project badges:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
