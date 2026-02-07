import type { Permission } from "@/config"
import { UserRole } from "@/lib/generated/prisma/enums"
import type { User } from "@/prisma/users/select"

/**
 * Check if a user has a permission (client-side, pure function).
 * Use this when you already have the user object (e.g. from props or context).
 * For components that need the current user, prefer the usePermission() hook.
 *
 * Admins have all permissions. Staff must have the permission in their list.
 */
export function hasClientPermission(
  user: User | null | undefined,
  permission: Permission
): boolean {
  if (!user) return false
  if (user.role === UserRole.ADMIN) return true
  return (user.permissions ?? []).includes(permission)
}
