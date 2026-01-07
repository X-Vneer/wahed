import db from "@/lib/db"
import { transformCity } from "@/prisma/cities"
import { getLocale, getTranslations } from "next-intl/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cities = await db.city.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        region: true,
      },
    })

    const locale = await getLocale()

    const transformedCities = cities.map((city) => {
      return transformCity(city, locale)
    })

    return NextResponse.json({
      data: transformedCities,
      success: true,
      status: 200,
    })
  } catch (error) {
    console.error("Error fetching cities:", error)
    const t = await getTranslations()
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
