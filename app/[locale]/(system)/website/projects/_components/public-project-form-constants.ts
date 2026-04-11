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

export function slugFromEnglishTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96)
}
