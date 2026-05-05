import { addDays, getDay } from "date-fns"

// Weekend in this app's calendar = Friday (5) + Saturday (6),
// matching the `weekStartsOn: 6` convention used by event-calendar views.
const WEEKEND_DAYS = new Set([5, 6])

export function isWorkingDay(date: Date): boolean {
  return !WEEKEND_DAYS.has(getDay(date))
}

export function addWorkingDays(start: Date, days: number): Date {
  if (days <= 0) return start
  let date = start
  let added = 0
  while (added < days) {
    date = addDays(date, 1)
    if (isWorkingDay(date)) added++
  }
  return date
}

export function workingDaysBetween(start: Date, end: Date): number {
  if (end <= start) return 0
  let count = 0
  let cursor = start
  while (cursor < end) {
    cursor = addDays(cursor, 1)
    if (cursor <= end && isWorkingDay(cursor)) count++
  }
  return count
}

export function getEstimatedDueDate(
  startedAt: Date | string | null | undefined,
  workingDays: number | null | undefined
): Date | null {
  if (startedAt == null || workingDays == null || workingDays <= 0) return null
  const start = startedAt instanceof Date ? startedAt : new Date(startedAt)
  if (Number.isNaN(start.getTime())) return null
  return addWorkingDays(start, workingDays)
}

/**
 * Working days a task is late.
 * - Done tasks: lateness measured against doneAt (finished late counts).
 * - Not-done tasks: lateness measured against `now`.
 * Returns 0 when no due date is computable, or endpoint <= due.
 */
export function getTaskLateWorkingDays(
  startedAt: Date | string | null | undefined,
  workingDays: number | null | undefined,
  doneAt: Date | string | null | undefined,
  now: Date
): number {
  const due = getEstimatedDueDate(startedAt, workingDays)
  if (due == null) return 0
  const endpoint =
    doneAt != null ? (doneAt instanceof Date ? doneAt : new Date(doneAt)) : now
  if (Number.isNaN(endpoint.getTime())) return 0
  if (endpoint <= due) return 0
  return workingDaysBetween(due, endpoint)
}
