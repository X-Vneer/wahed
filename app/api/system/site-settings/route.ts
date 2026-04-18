import { PERMISSIONS } from "@/config"
import { updateSystemSiteSettingsSchema } from "@/lib/schemas/system-site-settings"
import {
  getSystemSiteSettingsAdmin,
  patchSystemSiteSettings,
} from "@/lib/system-site-settings/service"
import { transformZodError } from "@/lib/transform-errors"
import { getReqLocale } from "@/utils/get-req-locale"
import { hasPermission } from "@/utils/has-permission"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })

  try {
    const permissionCheck = await hasPermission(
      PERMISSIONS.SYSTEM_SETTINGS_MANAGEMENT
    )
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

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
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })

  try {
    const permissionCheck = await hasPermission(
      PERMISSIONS.SYSTEM_SETTINGS_MANAGEMENT
    )
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    const body = await request.json()
    const validationResult = updateSystemSiteSettingsSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: t("errors.validation_failed"),
          details: transformZodError(validationResult.error),
        },
        { status: 400 }
      )
    }

    const settings = await patchSystemSiteSettings(validationResult.data)
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error updating system site settings:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
