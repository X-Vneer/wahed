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
