import { PERMISSIONS } from "@/config"
import db from "@/lib/db"
import {
  initLocale,
  requirePermission,
  type DynamicRouteContext,
} from "@/lib/helpers"
import { type NextRequest, NextResponse } from "next/server"
import * as z from "zod/v4"

const MAX_FEATURED = 2

const schema = z.object({
  isFeatured: z.boolean(),
})

export async function PATCH(
  request: NextRequest,
  context: DynamicRouteContext<{ id: string }>
) {
  const { t } = await initLocale(request)

  try {
    const permError = await requirePermission(PERMISSIONS.WEBSITE_MANAGEMENT)
    if (permError) return permError

    const { id } = await context.params

    const project = await db.publicProject.findUnique({
      where: { id },
      select: { id: true, isFeatured: true },
    })

    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const body = await request.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: t("errors.invalid_request") },
        { status: 400 }
      )
    }

    if (result.data.isFeatured && !project.isFeatured) {
      const featuredCount = await db.publicProject.count({
        where: { isFeatured: true },
      })

      if (featuredCount >= MAX_FEATURED) {
        return NextResponse.json(
          { error: t("websiteCms.projects.errors.maxFeatured") },
          { status: 400 }
        )
      }
    }

    const updated = await db.publicProject.update({
      where: { id },
      data: { isFeatured: result.data.isFeatured },
      select: { id: true, isFeatured: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error toggling project featured:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
