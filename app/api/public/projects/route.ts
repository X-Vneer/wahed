import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { initLocale } from "@/utils"
import {
  publicProjectInclude,
  transformPublicProject,
} from "@/prisma/public-projects"
import { websiteContentLocaleSchema } from "@/schemas/website-content"
import { transformZodError } from "@/utils/transform-errors"

/**
 * Public read-only endpoint to list active public projects.
 * No authentication. Optional `locale=ar|en` query param.
 */
export async function GET(request: NextRequest) {
  const { locale: fallbackLocale, t } = await initLocale(request)

  try {
    const localeParam = request.nextUrl.searchParams.get("locale")
    const localeResult = websiteContentLocaleSchema.safeParse(
      localeParam ?? fallbackLocale
    )
    if (!localeResult.success) {
      return NextResponse.json(
        {
          error: t("errors.validation_failed"),
          details: transformZodError(localeResult.error),
        },
        { status: 400 }
      )
    }

    const locale = localeResult.data
    const featured = request.nextUrl.searchParams.get("featured")

    const where: { isActive: true; isFeatured?: true } = { isActive: true }
    if (featured === "true") {
      where.isFeatured = true
    }

    const raw = await db.publicProject.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: publicProjectInclude,
    })

    const projects = raw.map((p) => transformPublicProject(p, locale))

    return NextResponse.json(
      { projects },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    )
  } catch (error) {
    console.error("Error fetching public projects:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
