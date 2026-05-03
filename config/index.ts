export const LOCALES = ["ar", "en"]
export const SESSION_COOKIE_NAME = "access_token"

export const OPEN_WEATHER_ICON_BASE = "https://openweathermap.org/img/wn"

export const DEFAULT_LATITUDE = 24.774265
export const DEFAULT_LONGITUDE = 46.738586

/** localStorage key: when set, do not show the location permission dialog again */
export const LOCATION_PROMPT_DO_NOT_SHOW_KEY = "location_prompt_do_not_show"

/** Cookie to persist admin's layout choice: "staff" (default) | "admin" */
export const SYSTEM_LAYOUT_COOKIE_NAME = "system_layout"

/** Fixed system task status ID for "In Progress" – setting a task to this status sets startedAt. */
export const TASK_STATUS_ID_IN_PROGRESS = "task-status-in-progress"
export const TASK_STATUS_ID_COMPLETED = "task-status-completed"
export const TASK_STATUS_ID_CANCELLED = "task-status-cancelled"
export const TASK_STATUS_ID_PENDING = "task-status-pending"

/** Fixed system project status IDs. Labels editable in lists/project-status, cannot be deleted. */
export const PROJECT_STATUS_ID_PLANNING = "project-status-planning"
export const PROJECT_STATUS_ID_IN_PROGRESS = "project-status-in-progress"
export const PROJECT_STATUS_ID_ON_HOLD = "project-status-on-hold"
export const PROJECT_STATUS_ID_COMPLETED = "project-status-completed"
export const PROJECT_STATUS_ID_CANCELLED = "project-status-cancelled"

/** Fixed system public project status IDs. Labels editable in lists/public-project-status, cannot be deleted. */
export const PUBLIC_PROJECT_STATUS_ID_PLANNING = "public-project-status-planning"
export const PUBLIC_PROJECT_STATUS_ID_IN_PROGRESS =
  "public-project-status-in-progress"
export const PUBLIC_PROJECT_STATUS_ID_ON_HOLD = "public-project-status-on-hold"
export const PUBLIC_PROJECT_STATUS_ID_COMPLETED =
  "public-project-status-completed"
export const PUBLIC_PROJECT_STATUS_ID_CANCELLED =
  "public-project-status-cancelled"

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
