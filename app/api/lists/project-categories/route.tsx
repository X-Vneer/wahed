import db from "@/lib/db"
import { transformProjectCategory } from "@/prisma/project-categories"
import { getReqLocale } from "@/utils/get-req-locale"
import { getLocale, getTranslations } from "next-intl/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const locale = await getReqLocale(request)
  const t = await getTranslations(locale)
  try {
    // Fetch project categories from database
    const projectCategories = await db.projectCategory.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    const transformedProjectCategories = projectCategories.map(
      (projectCategory) => {
        return transformProjectCategory(projectCategory, locale)
      }
    )

    return NextResponse.json({
      data: transformedProjectCategories,
      success: true,
      status: 200,
    })
  } catch (error) {
    console.error("Error fetching project categories:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
