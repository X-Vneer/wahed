export const LOCALES = ["ar", "en"]
export const SESSION_COOKIE_NAME = "access_token"

/** Cookie to persist admin's layout choice: "staff" (default) | "admin" */
export const SYSTEM_LAYOUT_COOKIE_NAME = "system_layout"

/** Fixed system task status ID for "In Progress" – setting a task to this status sets startedAt. */
export const TASK_STATUS_ID_IN_PROGRESS = "task-status-in-progress"
export const TASK_STATUS_ID_COMPLETED = "task-status-completed"
export const TASK_STATUS_ID_CANCELLED = "task-status-cancelled"
export const TASK_STATUS_ID_PENDING = "task-status-pending"

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
