import { PERMISSIONS } from "@/config"
import db from "@/lib/db"
import { hasPermission } from "@/utils/has-permission"
import { getReqLocale } from "@/utils/get-req-locale"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"
import * as z from "zod/v4"

type RouteContext = { params: Promise<{ id: string }> }

const schema = z.object({
  isActive: z.boolean(),
})

export async function PATCH(request: NextRequest, context: RouteContext) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })

  try {
    const permissionCheck = await hasPermission(PERMISSIONS.WEBSITE_MANAGEMENT)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    const { id } = await context.params

    const project = await db.publicProject.findUnique({
      where: { id },
      select: { id: true },
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

    const updated = await db.publicProject.update({
      where: { id },
      data: { isActive: result.data.isActive },
      select: { id: true, isActive: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error toggling project visibility:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
