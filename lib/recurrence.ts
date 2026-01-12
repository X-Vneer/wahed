import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  isBefore,
  isAfter,
} from "date-fns"
import type { RecurrenceRule } from "@/lib/schemas/event"
import type { CalendarEvent } from "@/components/event-calendar"

/**
 * Expand a recurring event into individual instances based on the recurrence rule
 * @param event The base event with recurrence information
 * @param startDate The start date of the range to expand events for
 * @param endDate The end date of the range to expand events for
 * @returns Array of expanded event instances
 */
export function expandRecurringEvent(
  event: CalendarEvent & {
    isRecurring?: boolean
    recurrenceRule?: RecurrenceRule | null
    recurrenceEndDate?: Date | null
  },
  startDate: Date,
  endDate: Date
): CalendarEvent[] {
  if (!event.isRecurring || !event.recurrenceRule) {
    return [event]
  }

  const rule = event.recurrenceRule
  const instances: CalendarEvent[] = []
  const originalStart = new Date(event.start)
  const originalEnd = new Date(event.end)
  const duration = originalEnd.getTime() - originalStart.getTime()

  // Determine the end date for recurrence
  const recurrenceEnd = rule.endDate || event.recurrenceEndDate || endDate
  const effectiveEndDate = isBefore(recurrenceEnd, endDate)
    ? recurrenceEnd
    : endDate

  // Start from the original event date
  let currentDate = new Date(originalStart)

  // For weekly recurrence, we need to handle days of week
  if (rule.frequency === "WEEKLY") {
    const daysOfWeek = rule.daysOfWeek || [originalStart.getDay()]
    const interval = rule.interval || 1

    // Find the first occurrence within or after the start date range
    while (isBefore(currentDate, startDate)) {
      // Move to the next week
      currentDate = addWeeks(currentDate, interval)
    }

    // Generate instances
    while (!isAfter(currentDate, effectiveEndDate)) {
      // Check each day of week in the current week
      for (const dayOfWeek of daysOfWeek) {
        const instanceDate = new Date(currentDate)
        // Set to the correct day of week
        const currentDayOfWeek = instanceDate.getDay()
        const daysToAdd = (dayOfWeek - currentDayOfWeek + 7) % 7
        instanceDate.setDate(instanceDate.getDate() + daysToAdd)

        // Only create instance if it's within the date range
        if (
          !isBefore(instanceDate, startDate) &&
          !isAfter(instanceDate, effectiveEndDate)
        ) {
          const instanceEnd = new Date(instanceDate.getTime() + duration)
          instances.push({
            ...event,
            id: `${event.id}-${instanceDate.toISOString()}`,
            start: instanceDate,
            end: instanceEnd,
            // Store original event ID for operations
            originalEventId: event.id,
          } as CalendarEvent & { originalEventId: string })
        }
      }

      // Move to the next interval
      currentDate = addWeeks(currentDate, interval)
    }
  } else if (rule.frequency === "DAILY") {
    const interval = rule.interval || 1
    while (!isAfter(currentDate, effectiveEndDate)) {
      if (!isBefore(currentDate, startDate)) {
        const instanceEnd = new Date(currentDate.getTime() + duration)
        instances.push({
          ...event,
          id: `${event.id}-${currentDate.toISOString()}`,
          start: currentDate,
          end: instanceEnd,
          // Store original event ID for operations
          originalEventId: event.id,
        } as CalendarEvent & { originalEventId: string })
      }
      currentDate = addDays(currentDate, interval)
    }
  } else if (rule.frequency === "MONTHLY") {
    const interval = rule.interval || 1
    while (!isAfter(currentDate, effectiveEndDate)) {
      if (!isBefore(currentDate, startDate)) {
        const instanceEnd = new Date(currentDate.getTime() + duration)
        instances.push({
          ...event,
          id: `${event.id}-${currentDate.toISOString()}`,
          start: currentDate,
          end: instanceEnd,
          // Store original event ID for operations
          originalEventId: event.id,
        } as CalendarEvent & { originalEventId: string })
      }
      currentDate = addMonths(currentDate, interval)
    }
  } else if (rule.frequency === "YEARLY") {
    const interval = rule.interval || 1
    while (!isAfter(currentDate, effectiveEndDate)) {
      if (!isBefore(currentDate, startDate)) {
        const instanceEnd = new Date(currentDate.getTime() + duration)
        instances.push({
          ...event,
          id: `${event.id}-${currentDate.toISOString()}`,
          start: currentDate,
          end: instanceEnd,
          // Store original event ID for operations
          originalEventId: event.id,
        } as CalendarEvent & { originalEventId: string })
      }
      currentDate = addYears(currentDate, interval)
    }
  }

  // If no instances were generated (edge case), return the original event
  return instances.length > 0 ? instances : [event]
}

/**
 * Expand multiple events, handling both recurring and non-recurring events
 */
export function expandRecurringEvents(
  events: Array<
    CalendarEvent & {
      isRecurring?: boolean
      recurrenceRule?: RecurrenceRule | null
      recurrenceEndDate?: Date | null
    }
  >,
  startDate: Date,
  endDate: Date
): CalendarEvent[] {
  const expanded: CalendarEvent[] = []

  for (const event of events) {
    if (event.isRecurring && event.recurrenceRule) {
      const instances = expandRecurringEvent(event, startDate, endDate)
      expanded.push(...instances)
    } else {
      expanded.push(event)
    }
  }

  return expanded
}

/**
 * Extract the original event ID from an expanded recurring event ID
 * Expanded IDs are in format: `${originalId}-${dateISOString}`
 * ISO date format: YYYY-MM-DDTHH:mm:ss.sssZ (e.g., 2024-01-15T10:30:00.000Z)
 * @param expandedId The expanded event ID
 * @returns The original event ID
 */
export function extractOriginalEventId(expandedId: string): string {
  // ISO date pattern: starts with 4 digits (year), followed by dashes, then 'T', then time
  // Pattern: -YYYY-MM-DDTHH:mm:ss.sssZ or -YYYY-MM-DDTHH:mm:ss.sss+HH:mm
  const isoDatePattern =
    /-\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})$/

  // Check if the ID ends with an ISO date pattern
  const match = expandedId.match(isoDatePattern)
  if (match) {
    // Find the index where the ISO date starts (before the dash)
    const dateStartIndex = match.index!
    // Extract the original ID (everything before the dash before the date)
    return expandedId.substring(0, dateStartIndex)
  }

  // Not an expanded ID, return as is
  return expandedId
}
