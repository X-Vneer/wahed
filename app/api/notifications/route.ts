import db from "@/lib/db"
import { getAccessTokenPayload } from "@/lib/get-access-token"
import { getReqLocale } from "@/utils/get-req-locale"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1", 10)
    const perPage = parseInt(searchParams.get("per_page") || "20", 10)
    const unreadOnly = searchParams.get("unread_only") === "true"

    const where = {
      userId: payload.userId,
      ...(unreadOnly ? { isRead: false } : {}),
    }

    const [notifications, total, unreadCount] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      db.notification.count({ where }),
      db.notification.count({
        where: { userId: payload.userId, isRead: false },
      }),
    ])

    return NextResponse.json({
      data: notifications,
      total,
      unreadCount,
      current_page: page,
      last_page: Math.ceil(total / perPage),
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
