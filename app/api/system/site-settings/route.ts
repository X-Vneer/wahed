import { PERMISSIONS } from "@/config"
import { initLocale, requirePermission, validateRequest } from "@/lib/helpers"
import { updateSystemSiteSettingsSchema } from "@/lib/schemas/system-site-settings"
import {
  getSystemSiteSettingsAdmin,
  patchSystemSiteSettings,
} from "@/lib/system-site-settings/service"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { t } = await initLocale(request)

  try {
    const permError = await requirePermission(
      PERMISSIONS.SYSTEM_SETTINGS_MANAGEMENT
    )
    if (permError) return permError

    const settings = await getSystemSiteSettingsAdmin()
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching system site settings:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  const { t } = await initLocale(request)

  try {
    const permError = await requirePermission(
      PERMISSIONS.SYSTEM_SETTINGS_MANAGEMENT
    )
    if (permError) return permError

    const body = await request.json()
    const validation = validateRequest(updateSystemSiteSettingsSchema, body, t)
    if (validation.error) return validation.error

    const settings = await patchSystemSiteSettings(validation.data)
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error updating system site settings:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
