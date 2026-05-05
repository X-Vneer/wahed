import {
  NotificationCategory,
  NotificationChannel,
} from "@/lib/generated/prisma/enums"

export type NotificationGroup = "TASKS" | "PROJECTS" | "EVENTS" | "CONTACTS"

export type NotificationCategoryConfig = {
  key: NotificationCategory
  group: NotificationGroup
  /** i18n key under `notifications.content.{contentKey}` for in-app render. */
  contentKey: string
  /** i18n key under `emails.{emailKey}` for email render. */
  emailKey: string
  defaultChannel: NotificationChannel
  relatedType: "task" | "project" | "event" | "contact"
}

export const NOTIFICATION_CATEGORIES: NotificationCategoryConfig[] = [
  {
    key: NotificationCategory.TASK_CREATED,
    group: "TASKS",
    contentKey: "task_created",
    emailKey: "task_created",
    defaultChannel: NotificationChannel.IN_APP,
    relatedType: "task",
  },
  {
    key: NotificationCategory.TASK_UPDATED,
    group: "TASKS",
    contentKey: "task_updated",
    emailKey: "task_updated",
    defaultChannel: NotificationChannel.IN_APP,
    relatedType: "task",
  },
  {
    key: NotificationCategory.TASK_ASSIGNED,
    group: "TASKS",
    contentKey: "task_assigned",
    emailKey: "task_assigned",
    defaultChannel: NotificationChannel.BOTH,
    relatedType: "task",
  },
  {
    key: NotificationCategory.TASK_UNASSIGNED,
    group: "TASKS",
    contentKey: "task_unassigned",
    emailKey: "task_unassigned",
    defaultChannel: NotificationChannel.IN_APP,
    relatedType: "task",
  },
  {
    key: NotificationCategory.TASK_STATUS_CHANGED,
    group: "TASKS",
    contentKey: "task_status_changed",
    emailKey: "task_status_changed",
    defaultChannel: NotificationChannel.IN_APP,
    relatedType: "task",
  },
  {
    key: NotificationCategory.TASK_COMPLETED,
    group: "TASKS",
    contentKey: "task_completed",
    emailKey: "task_completed",
    defaultChannel: NotificationChannel.BOTH,
    relatedType: "task",
  },
  {
    key: NotificationCategory.TASK_REOPENED,
    group: "TASKS",
    contentKey: "task_reopened",
    emailKey: "task_reopened",
    defaultChannel: NotificationChannel.IN_APP,
    relatedType: "task",
  },
  {
    key: NotificationCategory.TASK_COMMENTED,
    group: "TASKS",
    contentKey: "task_commented",
    emailKey: "task_commented",
    defaultChannel: NotificationChannel.IN_APP,
    relatedType: "task",
  },
  {
    key: NotificationCategory.TASK_ATTACHMENTS_UPDATED,
    group: "TASKS",
    contentKey: "task_attachments_updated",
    emailKey: "task_attachments_updated",
    defaultChannel: NotificationChannel.IN_APP,
    relatedType: "task",
  },
  {
    key: NotificationCategory.TASKS_IMPORTED,
    group: "TASKS",
    contentKey: "tasks_imported",
    emailKey: "tasks_imported",
    defaultChannel: NotificationChannel.IN_APP,
    relatedType: "task",
  },
  {
    key: NotificationCategory.SUBTASK_ADDED,
    group: "TASKS",
    contentKey: "subtask_added",
    emailKey: "subtask_added",
    defaultChannel: NotificationChannel.IN_APP,
    relatedType: "task",
  },
  {
    key: NotificationCategory.PROJECT_CREATED,
    group: "PROJECTS",
    contentKey: "project_created",
    emailKey: "project_created",
    defaultChannel: NotificationChannel.IN_APP,
    relatedType: "project",
  },
  {
    key: NotificationCategory.PROJECT_UPDATED,
    group: "PROJECTS",
    contentKey: "project_updated",
    emailKey: "project_updated",
    defaultChannel: NotificationChannel.IN_APP,
    relatedType: "project",
  },
  {
    key: NotificationCategory.PROJECT_ATTACHMENTS_UPDATED,
    group: "PROJECTS",
    contentKey: "project_attachments_updated",
    emailKey: "project_attachments_updated",
    defaultChannel: NotificationChannel.IN_APP,
    relatedType: "project",
  },
  {
    key: NotificationCategory.PROJECT_ARCHIVED,
    group: "PROJECTS",
    contentKey: "project_archived",
    emailKey: "project_archived",
    defaultChannel: NotificationChannel.IN_APP,
    relatedType: "project",
  },
  {
    key: NotificationCategory.PROJECT_UNARCHIVED,
    group: "PROJECTS",
    contentKey: "project_unarchived",
    emailKey: "project_unarchived",
    defaultChannel: NotificationChannel.IN_APP,
    relatedType: "project",
  },
  {
    key: NotificationCategory.EVENT_CREATED,
    group: "EVENTS",
    contentKey: "event_created",
    emailKey: "event_created",
    defaultChannel: NotificationChannel.IN_APP,
    relatedType: "event",
  },
  {
    key: NotificationCategory.EVENT_UPDATED,
    group: "EVENTS",
    contentKey: "event_updated",
    emailKey: "event_updated",
    defaultChannel: NotificationChannel.IN_APP,
    relatedType: "event",
  },
  {
    key: NotificationCategory.EVENT_DELETED,
    group: "EVENTS",
    contentKey: "event_deleted",
    emailKey: "event_deleted",
    defaultChannel: NotificationChannel.IN_APP,
    relatedType: "event",
  },
  {
    key: NotificationCategory.EVENT_INVITED,
    group: "EVENTS",
    contentKey: "event_invited",
    emailKey: "event_invited",
    defaultChannel: NotificationChannel.BOTH,
    relatedType: "event",
  },
  {
    key: NotificationCategory.CONTACT_RECEIVED,
    group: "CONTACTS",
    contentKey: "contact_received",
    emailKey: "contact_received",
    defaultChannel: NotificationChannel.IN_APP,
    relatedType: "contact",
  },
]

export const NOTIFICATION_CATEGORY_BY_KEY = Object.fromEntries(
  NOTIFICATION_CATEGORIES.map((c) => [c.key, c])
) as Record<NotificationCategory, NotificationCategoryConfig>

export const NOTIFICATION_GROUPS: NotificationGroup[] = [
  "TASKS",
  "PROJECTS",
  "EVENTS",
  "CONTACTS",
]

export const NOTIFICATION_CHANNELS: NotificationChannel[] = [
  NotificationChannel.NONE,
  NotificationChannel.IN_APP,
  NotificationChannel.EMAIL,
  NotificationChannel.BOTH,
]

export function getDefaultChannel(
  category: NotificationCategory
): NotificationChannel {
  return (
    NOTIFICATION_CATEGORY_BY_KEY[category]?.defaultChannel ??
    NotificationChannel.BOTH
  )
}
