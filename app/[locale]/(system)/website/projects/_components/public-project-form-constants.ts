export const PROJECT_STATUSES = [
  "PLANNING",
  "IN_PROGRESS",
  "ON_HOLD",
  "COMPLETED",
  "CANCELLED",
] as const

export const STATUS_LABEL_KEYS: Record<
  (typeof PROJECT_STATUSES)[number],
  | "projects.status.planning"
  | "projects.status.inProgress"
  | "projects.status.onHold"
  | "projects.status.completed"
  | "projects.status.cancelled"
> = {
  PLANNING: "projects.status.planning",
  IN_PROGRESS: "projects.status.inProgress",
  ON_HOLD: "projects.status.onHold",
  COMPLETED: "projects.status.completed",
  CANCELLED: "projects.status.cancelled",
}

export function generateSlug(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]+/g, "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "-and-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96)
}
