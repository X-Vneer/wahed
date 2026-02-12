/**
 * Permissions constants
 *
 * This file re-exports permissions from Prisma-generated enums to ensure
 * type safety and automatic synchronization with the database schema.
 *
 * When the Prisma schema is updated, run `prisma generate` to update these constants.
 */

import { PermissionKey as PrismaPermissionKey } from "@/lib/generated/prisma/enums"

/**
 * All available permission keys as a const object
 * Automatically synced with Prisma PermissionKey enum
 */
export const PERMISSIONS = PrismaPermissionKey

/**
 * Grouped permission keys by category
 * Provides a more organized way to access permissions
 */
export const PERMISSIONS_GROUPED = {
  PROJECT: {
    CREATE: PrismaPermissionKey.PROJECT_CREATE,
    UPDATE: PrismaPermissionKey.PROJECT_UPDATE,
    DELETE: PrismaPermissionKey.PROJECT_DELETE,
    VIEW: PrismaPermissionKey.PROJECT_VIEW,
    ARCHIVE: PrismaPermissionKey.PROJECT_ARCHIVE,
    UNARCHIVE: PrismaPermissionKey.PROJECT_UNARCHIVE,
  },
  TASK: {
    CREATE: PrismaPermissionKey.TASK_CREATE,
    UPDATE: PrismaPermissionKey.TASK_UPDATE,
    DELETE: PrismaPermissionKey.TASK_DELETE,
    ASSIGN: PrismaPermissionKey.TASK_ASSIGN,
    VIEW: PrismaPermissionKey.TASK_VIEW,
  },

  STAFF: {
    MANAGEMENT: PrismaPermissionKey.STAFF_MANAGEMENT,
  },
  STAFF_PAGE: {
    MANAGEMENT: PrismaPermissionKey.STAFF_PAGE_MANAGEMENT,
  },
  LIST: {
    CREATE: PrismaPermissionKey.LIST_CREATE,
    UPDATE: PrismaPermissionKey.LIST_UPDATE,
    DELETE: PrismaPermissionKey.LIST_DELETE,
  },
} as const

/**
 * Type for permission keys
 */
export type Permission =
  (typeof PrismaPermissionKey)[keyof typeof PrismaPermissionKey]

/**
 * Array of all permission keys
 * Useful for iteration, validation, etc.
 */
export const PERMISSION_KEYS = Object.values(
  PrismaPermissionKey
) as Permission[]

/**
 * Array of all permission key names (for display purposes)
 */
export const PERMISSION_NAMES = Object.keys(PrismaPermissionKey) as Array<
  keyof typeof PrismaPermissionKey
>

/**
 * Helper function to check if a string is a valid permission key
 */
export function isValidPermission(value: string): value is Permission {
  return PERMISSION_KEYS.includes(value as Permission)
}

/**
 * Helper function to get all permission keys as an array
 */
export function getAllPermissions(): Permission[] {
  return [...PERMISSION_KEYS]
}

// Re-export the type for convenience
export type { PermissionKey } from "@/lib/generated/prisma/enums"
