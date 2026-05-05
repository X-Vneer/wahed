import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { initLocale, type DynamicRouteContext } from "@/utils"
import {
  publicProjectInclude,
  transformPublicProject,
} from "@/prisma/public-projects"
import { websiteContentLocaleSchema } from "@/schemas/website-content"
import { transformZodError } from "@/utils/transform-errors"

/**
 * Public read-only endpoint to get a single active public project by slug.
 * No authentication. Optional `locale=ar|en` query param.
 */
export async function GET(
  request: NextRequest,
  context: DynamicRouteContext<{ slug: string }>
) {
  const { locale: fallbackLocale, t } = await initLocale(request)

  try {
    const { slug } = await context.params

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

    const project = await db.publicProject.findUnique({
      where: { slug, isActive: true },
      include: publicProjectInclude,
    })

    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json(
      { project: transformPublicProject(project, locale) },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    )
  } catch (error) {
    console.error("Error fetching public project:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
