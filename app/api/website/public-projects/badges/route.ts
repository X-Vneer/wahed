import { PERMISSIONS } from "@/config"
import db from "@/lib/db"
import { getReqLocale } from "@/utils/get-req-locale"
import { hasPermission } from "@/utils/has-permission"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(_request: NextRequest) {
  const locale = await getReqLocale(_request)
  const t = await getTranslations({ locale })

  try {
    const permissionCheck = await hasPermission(PERMISSIONS.WEBSITE_MANAGEMENT)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

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
