import db from "@/lib/db"
import { initLocale, requireAuth, type DynamicRouteContext } from "@/utils"
import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(
  request: NextRequest,
  { params }: DynamicRouteContext
) {
  const { t } = await initLocale(request)

  try {
    const auth = await requireAuth(t)
    if (auth.error) return auth.error
    const { payload } = auth

    const { id } = await params

    const notification = await db.notification.findFirst({
      where: { id, userId: payload.userId },
    })

    if (!notification) {
      return NextResponse.json(
        { error: t("notifications.errors.not_found") },
        { status: 404 }
      )
    }

    const updated = await db.notification.update({
      where: { id },
      data: { isRead: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: DynamicRouteContext
) {
  const { t } = await initLocale(request)

  try {
    const auth = await requireAuth(t)
    if (auth.error) return auth.error
    const { payload } = auth

    const { id } = await params

    const notification = await db.notification.findFirst({
      where: { id, userId: payload.userId },
    })

    if (!notification) {
      return NextResponse.json(
        { error: t("notifications.errors.not_found") },
        { status: 404 }
      )
    }

    await db.notification.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
