export const LOCALES = ["ar", "en"]
export const SESSION_COOKIE_NAME = "access_token"

/** Fixed system task status ID for "In Progress" – setting a task to this status sets startedAt. */
export const TASK_STATUS_ID_IN_PROGRESS = "task-status-in-progress"

// Re-export permissions constants for convenience
export {
  PERMISSIONS,
  PERMISSIONS_GROUPED,
  PERMISSION_KEYS,
  PERMISSION_NAMES,
  isValidPermission,
  getAllPermissions,
  type Permission,
  type PermissionKey,
} from "./permissions"
