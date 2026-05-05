import { PERMISSIONS } from "@/config"
import db from "@/lib/db"
import { initLocale, requirePermission } from "@/utils"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(_request: NextRequest) {
  const { t } = await initLocale(_request)

  try {
    const permError = await requirePermission(PERMISSIONS.WEBSITE_MANAGEMENT)
    if (permError) return permError

    const features = await db.publicProjectFeature.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        labelAr: true,
        labelEn: true,
        valueAr: true,
        valueEn: true,
        icon: true,
      },
    })

    return NextResponse.json({ data: features })
  } catch (error) {
    console.error("Error listing public project features:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
