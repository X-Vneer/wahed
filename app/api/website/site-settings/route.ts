import { PERMISSIONS } from "@/config"
import { initLocale, requirePermission, validateRequest } from "@/lib/helpers"
import { updateWebsiteSiteSettingsSchema } from "@/lib/schemas/website-site-settings"
import {
  getWebsiteSiteSettingsAdmin,
  patchWebsiteSiteSettings,
} from "@/lib/website-site-settings/service"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { t } = await initLocale(request)

  try {
    const permError = await requirePermission(PERMISSIONS.WEBSITE_MANAGEMENT)
    if (permError) return permError

    const settings = await getWebsiteSiteSettingsAdmin()
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching website site settings:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  const { t } = await initLocale(request)

  try {
    const permError = await requirePermission(PERMISSIONS.WEBSITE_MANAGEMENT)
    if (permError) return permError

    const body = await request.json()
    const validation = validateRequest(
      updateWebsiteSiteSettingsSchema,
      body,
      t
    )
    if (validation.error) return validation.error

    const settings = await patchWebsiteSiteSettings(validation.data)
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error updating website site settings:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
