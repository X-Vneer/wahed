import db from "@/lib/db"
import { getAccessTokenPayload } from "@/lib/get-access-token"
import { getReqLocale } from "@/utils/get-req-locale"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
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

export async function DELETE(request: NextRequest, { params }: RouteContext) {
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
