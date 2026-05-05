import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import {
  initLocale,
  requirePermission,
  type DynamicRouteContext,
} from "@/utils"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(
  request: NextRequest,
  context: DynamicRouteContext
) {
  const { t } = await initLocale(request)
  try {
    const permError = await requirePermission(
      PERMISSIONS_GROUPED.PROJECT.UPDATE
    )
    if (permError) return permError

    const { id } = await context.params

    const deleted = await db.systemFile.deleteMany({
      where: { id },
    })

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: t("errors.file_not_found") },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting file:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
