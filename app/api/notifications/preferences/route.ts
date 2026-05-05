import { type NextRequest, NextResponse } from "next/server"

import { NOTIFICATION_CATEGORIES, getDefaultChannel } from "@/config/notifications"
import db from "@/lib/db"
import {
  NotificationCategory,
  NotificationChannel,
} from "@/lib/generated/prisma/enums"
import { initLocale, requireAuth, validateRequest } from "@/lib/helpers"
import { updateNotificationPreferencesSchema } from "@/lib/schemas/notification-preferences"

export async function GET(request: NextRequest) {
  const { t } = await initLocale(request)

  try {
    const auth = await requireAuth(t)
    if (auth.error) return auth.error
    const { payload } = auth

    const stored = await db.notificationPreference.findMany({
      where: { userId: payload.userId },
      select: { category: true, channel: true },
    })
    const map = new Map(stored.map((p) => [p.category, p.channel]))

    const preferences = NOTIFICATION_CATEGORIES.map((c) => ({
      category: c.key,
      channel: map.get(c.key) ?? getDefaultChannel(c.key),
      group: c.group,
    }))

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error("Error fetching notification preferences:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const { t } = await initLocale(request)

  try {
    const auth = await requireAuth(t)
    if (auth.error) return auth.error
    const { payload } = auth

    const body = await request.json()
    const validation = validateRequest(
      updateNotificationPreferencesSchema,
      body,
      t
    )
    if (validation.error) return validation.error
    const { data } = validation

    await db.$transaction(
      data.preferences.map((p) =>
        db.notificationPreference.upsert({
          where: {
            userId_category: {
              userId: payload.userId,
              category: p.category as NotificationCategory,
            },
          },
          create: {
            userId: payload.userId,
            category: p.category as NotificationCategory,
            channel: p.channel as NotificationChannel,
          },
          update: { channel: p.channel as NotificationChannel },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating notification preferences:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
