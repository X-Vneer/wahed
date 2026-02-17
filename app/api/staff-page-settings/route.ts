import db from "@/lib/db"
import { updateStaffPageSettingsSchema } from "@/lib/schemas/staff-page-settings"
import { transformZodError } from "@/lib/transform-errors"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"
import { hasPermission } from "@/utils/has-permission"
import { PERMISSIONS_GROUPED } from "@/config"
import { getReqLocale } from "@/utils/get-req-locale"

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
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })

  try {
    const permissionCheck = await hasPermission(
      PERMISSIONS_GROUPED.STAFF_PAGE.MANAGEMENT
    )
    if (!permissionCheck.hasPermission) {
      return permissionCheck.error!
    }

    const body = await request.json()
    const validationResult = updateStaffPageSettingsSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: transformZodError(validationResult.error),
        },
        { status: 400 }
      )
    }

    const data = validationResult.data
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
