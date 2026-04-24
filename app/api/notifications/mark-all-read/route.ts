import db from "@/lib/db"
import { initLocale, requireAuth } from "@/lib/helpers"
import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest) {
  const { t } = await initLocale(request)

  try {
    const auth = await requireAuth(t)
    if (auth.error) return auth.error
    const { payload } = auth

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
