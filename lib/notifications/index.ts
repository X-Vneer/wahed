import {
  NOTIFICATION_CATEGORY_BY_KEY,
  getDefaultChannel,
} from "@/config/notifications"
import db from "@/lib/db"
import {
  NotificationCategory,
  NotificationChannel,
  UserRole,
} from "@/lib/generated/prisma/enums"
import { sendMail } from "@/lib/mailer/send"
import { renderEmail } from "@/lib/mailer/templates"

export type { NotificationCategory } from "@/lib/generated/prisma/enums"

interface CreateNotificationParams {
  userIds: string[]
  category: NotificationCategory
  messageParams?: Record<string, string | number>
  relatedId?: string
  relatedType?: "task" | "project" | "contact" | "event"
  /** Override CTA url; falls back to category-default deep link. */
  ctaUrl?: string
}

/**
 * Dispatch notifications across in-app + email channels respecting per-user
 * NotificationPreference. Non-blocking — errors are logged, never thrown.
 */
export async function createNotifications({
  userIds,
  category,
  messageParams,
  relatedId,
  relatedType,
  ctaUrl,
}: CreateNotificationParams) {
  if (userIds.length === 0) return

  const config = NOTIFICATION_CATEGORY_BY_KEY[category]
  if (!config) {
    console.error("Unknown notification category:", category)
    return
  }

  const uniqueIds = [...new Set(userIds)]
  const resolvedRelatedType = relatedType ?? config.relatedType

  try {
    const prefs = await db.notificationPreference.findMany({
      where: { userId: { in: uniqueIds }, category },
      select: { userId: true, channel: true },
    })
    const prefByUser = new Map(prefs.map((p) => [p.userId, p.channel]))
    const defaultChannel = getDefaultChannel(category)

    const inAppIds: string[] = []
    const emailIds: string[] = []
    for (const uid of uniqueIds) {
      const ch = prefByUser.get(uid) ?? defaultChannel
      if (ch === NotificationChannel.IN_APP || ch === NotificationChannel.BOTH) {
        inAppIds.push(uid)
      }
      if (ch === NotificationChannel.EMAIL || ch === NotificationChannel.BOTH) {
        emailIds.push(uid)
      }
    }

    if (inAppIds.length > 0) {
      await db.notification.createMany({
        data: inAppIds.map((userId) => ({
          userId,
          type: category,
          category,
          title: config.contentKey,
          message: JSON.stringify(messageParams ?? {}),
          relatedId: relatedId ?? null,
          relatedType: resolvedRelatedType ?? null,
        })),
      })
    }

    if (emailIds.length > 0) {
      void dispatchEmails({
        userIds: emailIds,
        category,
        messageParams: messageParams ?? {},
        relatedId,
        ctaUrl,
      })
    }
  } catch (error) {
    console.error("Failed to create notifications:", error)
  }
}

async function dispatchEmails({
  userIds,
  category,
  messageParams,
  relatedId,
  ctaUrl,
}: {
  userIds: string[]
  category: NotificationCategory
  messageParams: Record<string, string | number>
  relatedId?: string
  ctaUrl?: string
}) {
  try {
    const users = await db.user.findMany({
      where: { id: { in: userIds }, isActive: true },
      select: { id: true, email: true, name: true, locale: true },
    })

    await Promise.allSettled(
      users.map(async (user) => {
        const locale = (user.locale as "ar" | "en") || "ar"
        try {
          const { subject, html, text } = await renderEmail({
            category,
            locale,
            recipientName: user.name,
            params: messageParams,
            ctaUrl,
          })
          await sendMail({
            to: user.email,
            subject,
            html,
            text,
            category,
            relatedId: relatedId ?? null,
          })
        } catch (err) {
          console.error("[notifications] email render/send failed:", err)
        }
      })
    )
  } catch (error) {
    console.error("[notifications] dispatchEmails failed:", error)
  }
}

/**
 * Get all admin user IDs.
 */
export async function getAdminUserIds(): Promise<string[]> {
  const admins = await db.user.findMany({
    where: { role: UserRole.ADMIN, isActive: true },
    select: { id: true },
  })
  return admins.map((u) => u.id)
}

/**
 * Get all user IDs assigned to a task.
 */
export async function getTaskAssigneeIds(taskId: string): Promise<string[]> {
  const task = await db.task.findUnique({
    where: { id: taskId },
    select: {
      createdById: true,
      assignedTo: { select: { id: true } },
    },
  })
  if (!task) return []
  return task.assignedTo.map((u) => u.id)
}

/**
 * Get all user IDs involved in a project (task creators + assignees).
 */
export async function getProjectStakeholderIds(
  projectId: string
): Promise<string[]> {
  const tasks = await db.task.findMany({
    where: { projectId },
    select: {
      createdById: true,
      assignedTo: { select: { id: true } },
    },
  })
  const userIds = new Set<string>()
  for (const task of tasks) {
    userIds.add(task.createdById)
    for (const user of task.assignedTo) {
      userIds.add(user.id)
    }
  }
  return [...userIds]
}

/**
 * Get all attendee user IDs for an event.
 */
export async function getEventAttendeeIds(eventId: string): Promise<string[]> {
  const attendees = await db.eventAttendee.findMany({
    where: { eventId },
    select: { userId: true },
  })
  return attendees.map((a) => a.userId)
}

/**
 * Get task creator + assignees (all stakeholders).
 */
export async function getTaskStakeholderIds(taskId: string): Promise<{
  creatorId: string | null
  assigneeIds: string[]
}> {
  const task = await db.task.findUnique({
    where: { id: taskId },
    select: {
      createdById: true,
      assignedTo: { select: { id: true } },
    },
  })
  if (!task) return { creatorId: null, assigneeIds: [] }
  return {
    creatorId: task.createdById,
    assigneeIds: task.assignedTo.map((u) => u.id),
  }
}
