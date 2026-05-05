import { PERMISSIONS } from "@/config"
import db from "@/lib/db"
import { requirePermission } from "@/utils"
import { type NextRequest, NextResponse } from "next/server"

/**
 * GET /api/website/public-projects/check-slug?slug=xxx&excludeId=yyy
 *
 * Returns { available: boolean } for the given slug.
 * `excludeId` is optional — pass the current project id when editing
 * so the project's own slug doesn't count as a conflict.
 */
export async function GET(request: NextRequest) {
  const permError = await requirePermission(PERMISSIONS.WEBSITE_MANAGEMENT)
  if (permError) return permError

  const slug = request.nextUrl.searchParams.get("slug")?.trim().toLowerCase()
  if (!slug) {
    return NextResponse.json({ available: false }, { status: 400 })
  }

  const excludeId = request.nextUrl.searchParams.get("excludeId") ?? undefined

  const existing = await db.publicProject.findUnique({
    where: { slug },
    select: { id: true },
  })

  const available = !existing || existing.id === excludeId

  return NextResponse.json({ available })
}
