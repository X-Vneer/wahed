import db from "@/lib/db"
import { getAccessTokenPayload } from "@/lib/get-access-token"
import { getReqLocale } from "@/utils/get-req-locale"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })

  try {
    const payload = await getAccessTokenPayload()
    if (!payload?.userId) {
      return NextResponse.json(
        { error: t("errors.unauthorized") },
        { status: 401 }
      )
    }

    await db.notification.updateMany({
      where: { userId: payload.userId, isRead: false },
      data: { isRead: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
