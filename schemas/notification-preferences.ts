import * as z from "zod/v4"

import {
  NotificationCategory,
  NotificationChannel,
} from "@/lib/generated/prisma/enums"

const categoryEnum = z.enum(
  Object.values(NotificationCategory) as [string, ...string[]]
)
const channelEnum = z.enum(
  Object.values(NotificationChannel) as [string, ...string[]]
)

export const notificationPreferenceItemSchema = z.object({
  category: categoryEnum,
  channel: channelEnum,
})

export const updateNotificationPreferencesSchema = z.object({
  preferences: z.array(notificationPreferenceItemSchema).max(100),
})

export type UpdateNotificationPreferencesInput = z.infer<
  typeof updateNotificationPreferencesSchema
>
