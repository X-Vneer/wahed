"use client"

import { CalendarEvent } from "@/components/event-calendar"
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query"
import apiClient from "@/services"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { Event } from "@/prisma/events"
import { CreateEventInput, UpdateEventInput } from "@/lib/schemas/event"
import { EventColor } from "@/lib/generated/prisma/enums"

// API event response type (includes extra fields we don't need)
type ApiEvent = Event

export interface EventsResponse {
  events: ApiEvent[]
}

// Transform API event to CalendarEvent format
function transformEvent(apiEvent: ApiEvent): CalendarEvent {
  return {
    id: apiEvent.id,
    title: apiEvent.title,
    description: apiEvent.description || undefined,
    start: new Date(apiEvent.start),
    end: new Date(apiEvent.end),
    allDay: apiEvent.allDay ?? false,
    color: (apiEvent.color?.toLowerCase() || "sky") as CalendarEvent["color"],
    location: apiEvent.location || undefined,
    attendees: apiEvent.attendees || [],
  }
}

// Get date range - fetch 3 months worth of events to cover all views
function getDateRange(currentDate: Date): { start: string; end: string } {
  // Start from 1 month before current month
  const start = startOfMonth(
    new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
  )
  // End at 1 month after current month
  const end = endOfMonth(
    new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
  )

  return {
    start: format(start, "yyyy-MM-dd'T'HH:mm:ss"),
    end: format(end, "yyyy-MM-dd'T'HH:mm:ss"),
  }
}

export const useEvents = (
  currentDate: Date,
  options?: Omit<
    UseQueryOptions<CalendarEvent[], Error>,
    "queryKey" | "queryFn"
  >
) => {
  const dateRange = getDateRange(currentDate)

  const fetchEvents = async (): Promise<CalendarEvent[]> => {
    const response = await apiClient.get<EventsResponse>("/api/events", {
      params: {
        start: dateRange.start,
        end: dateRange.end,
      },
    })
    return response.data.events.map(transformEvent)
  }

  // Use month as key since we're fetching 3 months of data
  return useQuery<CalendarEvent[], Error>({
    queryKey: ["events", format(currentDate, "yyyy-MM")],
    queryFn: fetchEvents,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    ...options,
  })
}

// Hook to fetch a single event by ID
export const useEvent = (eventId: string | null) => {
  return useQuery<Event, Error>({
    queryKey: ["event", eventId],
    queryFn: async () => {
      if (!eventId) throw new Error("Event ID is required")
      const response = await apiClient.get<Event>(`/api/events/${eventId}`)
      // The API already returns the transformed event with recurrence fields
      return response.data
    },
    enabled: !!eventId,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 1,
  })
}

export const useCreateEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (event: Omit<CalendarEvent, "id">) => {
      console.log("🚀 ~ useCreateEvent ~ event:", event)
      // Transform to API format
      const eventWithRecurrence = event as CalendarEvent & {
        isRecurring?: boolean
        recurrenceRule?: {
          frequency: "WEEKLY" | "DAILY" | "MONTHLY" | "YEARLY"
          interval: number
          daysOfWeek?: number[]
          endDate?: Date
        }
        recurrenceEndDate?: Date
      }

      const apiEvent: CreateEventInput = {
        title: event.title,
        description: event.description,
        start: event.start,
        end: event.end,
        allDay: event.allDay ?? false,
        color: (event.color?.toUpperCase() || "SKY") as EventColor,
        location: event.location,
        attendeeIds: event.attendees?.map((attendee) => attendee.id) ?? [],
        // Recurrence fields
        isRecurring: eventWithRecurrence.isRecurring ?? false,
        recurrenceRule: eventWithRecurrence.recurrenceRule,
        recurrenceEndDate: eventWithRecurrence.recurrenceEndDate,
      }

      const response = await apiClient.post<ApiEvent>("/api/events", apiEvent)
      return transformEvent(response.data)
    },
    onMutate: async (newEvent: Omit<CalendarEvent, "id">) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ["events"] })

      // Snapshot the previous value for rollback
      const previousEvents = queryClient.getQueriesData<CalendarEvent[]>({
        queryKey: ["events"],
      })

      // Generate a temporary ID for the optimistic event
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
      const optimisticEvent: CalendarEvent = {
        ...newEvent,
        id: tempId,
      }

      // Optimistically add the event to all event queries
      queryClient.setQueriesData<CalendarEvent[]>(
        { queryKey: ["events"] },
        (old) => {
          if (!old) return [optimisticEvent]
          return [...old, optimisticEvent]
        }
      )

      // Return context with the snapshotted value for rollback
      return { previousEvents, tempId }
    },
    onError: (error, newEvent, context) => {
      // Rollback to the previous value on error
      if (context?.previousEvents) {
        context.previousEvents.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSuccess: (data, newEvent, context) => {
      // Replace the temporary event with the real one from the server
      queryClient.setQueriesData<CalendarEvent[]>(
        { queryKey: ["events"] },
        (old) => {
          if (!old) return [data]
          // Remove the temporary event and add the real one
          return old
            .filter((event) => event.id !== context?.tempId)
            .concat(data)
        }
      )
    },
    onSettled: () => {
      // Invalidate to ensure we're in sync with the server
      queryClient.invalidateQueries({ queryKey: ["events"] })
    },
  })
}

export const useUpdateEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...event }: CalendarEvent) => {
      // Extract original event ID if this is an expanded recurring event
      const originalId = extractOriginalEventId(id)

      // Transform to API format
      const eventWithRecurrence = event as CalendarEvent & {
        isRecurring?: boolean
        recurrenceRule?: {
          frequency: "WEEKLY" | "DAILY" | "MONTHLY" | "YEARLY"
          interval: number
          daysOfWeek?: number[]
          endDate?: Date
        }
        recurrenceEndDate?: Date
      }

      const apiEvent: UpdateEventInput = {
        title: event.title,
        description: event.description,
        start: event.start,
        end: event.end,
        allDay: event.allDay ?? false,
        color: (event.color?.toUpperCase() || "SKY") as EventColor,
        location: event.location,
        attendeeIds: event.attendees?.map((attendee) => attendee.id) ?? [],
        // Recurrence fields
        isRecurring: eventWithRecurrence.isRecurring ?? false,
        recurrenceRule: eventWithRecurrence.recurrenceRule,
        recurrenceEndDate: eventWithRecurrence.recurrenceEndDate,
      }

      const response = await apiClient.put<ApiEvent>(
        `/api/events/${originalId}`,
        apiEvent
      )
      return transformEvent(response.data)
    },
    onMutate: async (updatedEvent: CalendarEvent) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ["events"] })

      // Snapshot the previous value for rollback
      const previousEvents = queryClient.getQueriesData<CalendarEvent[]>({
        queryKey: ["events"],
      })

      // Optimistically update all event queries
      queryClient.setQueriesData<CalendarEvent[]>(
        { queryKey: ["events"] },
        (old) => {
          if (!old) return old
          return old.map((event) =>
            event.id === updatedEvent.id ? updatedEvent : event
          )
        }
      )

      // Return context with the snapshotted value for rollback
      return { previousEvents }
    },
    onError: (error, updatedEvent, context) => {
      // Rollback to the previous value on error
      if (context?.previousEvents) {
        context.previousEvents.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSuccess: (data) => {
      // Update cache with server response to ensure consistency
      queryClient.setQueriesData<CalendarEvent[]>(
        { queryKey: ["events"] },
        (old) => {
          if (!old) return old
          return old.map((event) => (event.id === data.id ? data : event))
        }
      )
    },
    onSettled: () => {
      // Invalidate to ensure we're in sync with the server
      queryClient.invalidateQueries({ queryKey: ["events"] })
    },
  })
}

import { extractOriginalEventId } from "@/lib/recurrence"

export const useDeleteEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (eventId: string) => {
      // Extract original event ID if this is an expanded recurring event
      const originalId = extractOriginalEventId(eventId)
      await apiClient.delete(`/api/events/${originalId}`)
      return originalId
    },
    onMutate: async (eventId: string) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ["events"] })

      // Snapshot the previous value for rollback
      const previousEvents = queryClient.getQueriesData<CalendarEvent[]>({
        queryKey: ["events"],
      })

      // Find the event being deleted for potential rollback
      let deletedEvent: CalendarEvent | undefined
      queryClient
        .getQueriesData<CalendarEvent[]>({ queryKey: ["events"] })
        .forEach(([, data]) => {
          if (data) {
            const event = data.find((e) => e.id === eventId)
            if (event) {
              deletedEvent = event
            }
          }
        })

      // Optimistically remove the event from all event queries
      queryClient.setQueriesData<CalendarEvent[]>(
        { queryKey: ["events"] },
        (old) => {
          if (!old) return old
          return old.filter((event) => event.id !== eventId)
        }
      )

      // Return context with the snapshotted value and deleted event for rollback
      return { previousEvents, deletedEvent }
    },
    onError: (error, eventId, context) => {
      // Rollback to the previous value on error
      if (context?.previousEvents) {
        context.previousEvents.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSuccess: () => {
      // Event is already removed optimistically, just ensure consistency
      queryClient.setQueriesData<CalendarEvent[]>(
        { queryKey: ["events"] },
        (old) => old // Keep the optimistic update
      )
    },
    onSettled: () => {
      // Invalidate to ensure we're in sync with the server
      queryClient.invalidateQueries({ queryKey: ["events"] })
    },
  })
}
