import db from "@/lib/db"
import { initLocale, parsePagination, requireAuth } from "@/utils"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { t } = await initLocale(request)

  try {
    const auth = await requireAuth(t)
    if (auth.error) return auth.error
    const { payload } = auth

    const searchParams = request.nextUrl.searchParams
    const { page, perPage, skip, take } = parsePagination(searchParams)
    const unreadOnly = searchParams.get("unread_only") === "true"

    const where = {
      userId: payload.userId,
      ...(unreadOnly ? { isRead: false } : {}),
    }

    const [notifications, total, unreadCount] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
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
