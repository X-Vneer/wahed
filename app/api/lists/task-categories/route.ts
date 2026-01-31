import db from "@/lib/db"
import { transformTaskCategory } from "@/prisma/task-categories"
import { getReqLocale } from "@/utils/get-req-locale"
import { getTranslations } from "next-intl/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })
  try {
    const taskCategories = await db.taskCategory.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    const transformedTaskCategories = taskCategories.map((taskCategory) =>
      transformTaskCategory(taskCategory, locale)
    )

    return NextResponse.json({
      data: transformedTaskCategories,
      success: true,
      status: 200,
    })
  } catch (error) {
    console.error("Error fetching task categories:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
