"use client"

import type { Permission } from "@/config"
import { useUserData } from "@/hooks/use-user-data"
import { hasClientPermission } from "@/utils/has-client-permission"

/**
 * Hook that returns a check-permission function for the current user.
 * Uses the current user from React Query (prefetched in layout).
 *
 * @example
 * const { checkPermission, isLoading } = usePermission()
 *
 * if (checkPermission(PERMISSIONS_GROUPED.PROJECT.DELETE)) {
 *   // show delete button
 * }
 */
export function usePermission() {
  const { data: user, isLoading } = useUserData()

  const checkPermission = (permission: Permission): boolean =>
    hasClientPermission(user, permission)

  return { checkPermission, isLoading }
}
