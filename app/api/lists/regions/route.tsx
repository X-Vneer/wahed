import db from "@/lib/db"
import { transformRegion } from "@/prisma/regions"
import { getLocale, getTranslations } from "next-intl/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Fetch project categories from database
    const regions = await db.region.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    const locale = await getLocale()

    const transformedRegions = regions.map((region) => {
      return transformRegion(region, locale)
    })

    return NextResponse.json({
      data: transformedRegions,
      success: true,
      status: 200,
    })
  } catch (error) {
    console.error("Error fetching project categories:", error)
    const t = await getTranslations()
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
