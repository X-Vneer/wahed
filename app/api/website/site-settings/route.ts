import { PERMISSIONS } from "@/config"
import { updateWebsiteSiteSettingsSchema } from "@/lib/schemas/website-site-settings"
import { transformZodError } from "@/lib/transform-errors"
import {
  getWebsiteSiteSettingsAdmin,
  patchWebsiteSiteSettings,
} from "@/lib/website-site-settings/service"
import { getReqLocale } from "@/utils/get-req-locale"
import { hasPermission } from "@/utils/has-permission"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })

  try {
    const permissionCheck = await hasPermission(PERMISSIONS.WEBSITE_MANAGEMENT)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

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
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })

  try {
    const permissionCheck = await hasPermission(PERMISSIONS.WEBSITE_MANAGEMENT)
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    const body = await request.json()
    const validationResult = updateWebsiteSiteSettingsSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: t("errors.validation_failed"),
          details: transformZodError(validationResult.error),
        },
        { status: 400 }
      )
    }

    const settings = await patchWebsiteSiteSettings(validationResult.data)
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error updating website site settings:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
