export const LOCALES = ["ar", "en"]
export const SESSION_COOKIE_NAME = "access_token"

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
