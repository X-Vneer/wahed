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

export const useCreateEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (event: Omit<CalendarEvent, "id">) => {
      console.log("🚀 ~ useCreateEvent ~ event:", event)
      // Transform to API format
      const apiEvent: CreateEventInput = {
        title: event.title,
        description: event.description,
        start: event.start,
        end: event.end,
        allDay: event.allDay ?? false,
        color: (event.color?.toUpperCase() || "SKY") as EventColor,
        location: event.location,
        attendeeIds: event.attendees?.map((attendee) => attendee.id) ?? [],
      }

      const response = await apiClient.post<ApiEvent>("/api/events", apiEvent)
      return transformEvent(response.data)
    },
    onSuccess: () => {
      // Invalidate all event queries to refetch
      queryClient.invalidateQueries({ queryKey: ["events"] })
    },
  })
}

export const useUpdateEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...event }: CalendarEvent) => {
      // Transform to API format
      const apiEvent: UpdateEventInput = {
        title: event.title,
        description: event.description,
        start: event.start,
        end: event.end,
        allDay: event.allDay ?? false,
        color: (event.color?.toUpperCase() || "SKY") as EventColor,
        location: event.location,
        attendeeIds: event.attendees?.map((attendee) => attendee.id) ?? [],
      }

      const response = await apiClient.put<ApiEvent>(
        `/api/events/${id}`,
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

export const useDeleteEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (eventId: string) => {
      await apiClient.delete(`/api/events/${eventId}`)
      return eventId
    },
    onSuccess: () => {
      // Invalidate all event queries to refetch
      queryClient.invalidateQueries({ queryKey: ["events"] })
    },
  })
}
