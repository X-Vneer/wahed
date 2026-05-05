import type { Prisma } from "@/lib/generated/prisma/client"
import { UserRole } from "@/lib/generated/prisma/enums"

export type TaskVisibilityUser = { userId: string; role: string }

export function buildVisibleTaskFilter(
  user: TaskVisibilityUser
): Prisma.TaskWhereInput {
  if (user.role === UserRole.ADMIN) return {}
  return {
    OR: [
      { assignedTo: { some: { id: user.userId } } },
      { assignedTo: { none: {} } },
    ],
  }
}

export function isTaskVisibleToUser(
  task: { assignedTo: Array<{ id: string }> },
  user: TaskVisibilityUser
): boolean {
  if (user.role === UserRole.ADMIN) return true
  if (task.assignedTo.length === 0) return true
  return task.assignedTo.some((u) => u.id === user.userId)
}
