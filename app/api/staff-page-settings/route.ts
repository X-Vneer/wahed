import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import { initLocale, requirePermission, validateRequest } from "@/lib/helpers"
import { updateStaffPageSettingsSchema } from "@/lib/schemas/staff-page-settings"
import { getReqLocale } from "@/utils/get-req-locale"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

const DEFAULT_ATTENDANCE_LINK = "/attendance"
const DEFAULT_ACCOUNTING_LINK = "/accounting"

export async function GET() {
  try {
    let settings = await db.staffPageSettings.findFirst({
      orderBy: { createdAt: "asc" },
    })

    if (!settings) {
      settings = await db.staffPageSettings.create({
        data: {
          attendanceLink: DEFAULT_ATTENDANCE_LINK,
          accountingLink: DEFAULT_ACCOUNTING_LINK,
        },
      })
    }

    return NextResponse.json({
      heroBackgroundImageUrl: settings.heroBackgroundImageUrl,
      attendanceLink: settings.attendanceLink || DEFAULT_ATTENDANCE_LINK,
      accountingLink: settings.accountingLink || DEFAULT_ACCOUNTING_LINK,
    })
  } catch (error) {
    console.error("Error fetching staff page settings:", error)
    const locale = await getReqLocale({ headers: new Headers() } as NextRequest)
    const t = await getTranslations({ locale })
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
      PERMISSIONS_GROUPED.STAFF_PAGE.MANAGEMENT
    )
    if (permError) return permError

    const body = await request.json()
    const validation = validateRequest(
      updateStaffPageSettingsSchema,
      body,
      t
    )
    if (validation.error) return validation.error
    const data = validation.data
    const heroUrl =
      data.heroBackgroundImageUrl === "" || data.heroBackgroundImageUrl == null
        ? null
        : data.heroBackgroundImageUrl ?? undefined

    const existing = await db.staffPageSettings.findFirst({
      orderBy: { createdAt: "asc" },
    })

    const settings = existing
      ? await db.staffPageSettings.update({
          where: { id: existing.id },
          data: {
            ...(heroUrl !== undefined && {
              heroBackgroundImageUrl: heroUrl,
            }),
            ...(data.attendanceLink !== undefined && {
              attendanceLink: data.attendanceLink,
            }),
            ...(data.accountingLink !== undefined && {
              accountingLink: data.accountingLink,
            }),
          },
        })
      : await db.staffPageSettings.create({
          data: {
            heroBackgroundImageUrl: heroUrl ?? null,
            attendanceLink: data.attendanceLink ?? DEFAULT_ATTENDANCE_LINK,
            accountingLink: data.accountingLink ?? DEFAULT_ACCOUNTING_LINK,
          },
        })

    return NextResponse.json({
      heroBackgroundImageUrl: settings.heroBackgroundImageUrl,
      attendanceLink: settings.attendanceLink || DEFAULT_ATTENDANCE_LINK,
      accountingLink: settings.accountingLink || DEFAULT_ACCOUNTING_LINK,
    })
  } catch (error) {
    console.error("Error updating staff page settings:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
