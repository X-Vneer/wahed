import db from "@/lib/db"
import { UserRole } from "@/lib/generated/prisma/enums"

export type NotificationType =
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "TASK_ASSIGNED"
  | "TASK_COMMENTED"
  | "PROJECT_CREATED"
  | "PROJECT_UPDATED"
  | "CONTACT_RECEIVED"

interface CreateNotificationParams {
  userIds: string[]
  type: NotificationType
  contentKey: string
  messageParams?: Record<string, string | number>
  relatedId?: string
  relatedType?: "task" | "project" | "contact"
}

/**
 * Create notifications for multiple users.
 * Stores the contentKey in `title` and JSON-encoded messageParams in `message`.
 * The frontend translates using these keys at display time.
 * Non-blocking — errors are logged but never thrown.
 */
export async function createNotifications({
  userIds,
  type,
  contentKey,
  messageParams,
  relatedId,
  relatedType,
}: CreateNotificationParams) {
  if (userIds.length === 0) return

  try {
    const uniqueIds = [...new Set(userIds)]
    await db.notification.createMany({
      data: uniqueIds.map((userId) => ({
        userId,
        type,
        title: contentKey,
        message: JSON.stringify(messageParams ?? {}),
        relatedId: relatedId ?? null,
        relatedType: relatedType ?? null,
      })),
    })
  } catch (error) {
    console.error("Failed to create notifications:", error)
  }
}

/**
 * Get all admin user IDs. Cached per request cycle.
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
