import db from "@/lib/db"
import { getLocale, getTranslations } from "next-intl/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Fetch project categories from database
    const projectCategories = await db.projectCategory.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    const locale = await getLocale()

    const transformedProjectCategories = projectCategories.map(
      (projectCategory) => {
        return {
          id: projectCategory.id,
          name:
            locale === "ar" ? projectCategory.nameAr : projectCategory.nameEn,
        }
      }
    )

    return NextResponse.json({
      data: transformedProjectCategories,
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
