"use client"

import type { AxiosError } from "axios"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import type { ErrorResponse } from "@/@types/error"
import {
  EventCalendar,
  SimpleAgendaCalendar,
  type CalendarEvent,
} from "@/components/event-calendar"
import { Spinner } from "@/components/ui/spinner"
import {
  useCreateEvent,
  useDeleteEvent,
  useEvents,
  useUpdateEvent,
} from "@/hooks/use-events"

export default function WeeklySchedule() {
  const t = useTranslations("calendar")
  const [currentDate] = useState(new Date())

  // Fetch events - we fetch 3 months of data to cover all views
  const { data: events = [], isLoading, error } = useEvents(currentDate)

  // Mutations
  const createEventMutation = useCreateEvent()
  const updateEventMutation = useUpdateEvent()
  const deleteEventMutation = useDeleteEvent()

  const handleEventAdd = async (event: CalendarEvent) => {
    try {
      await createEventMutation.mutateAsync(event)
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>
      toast.error(
        axiosError?.response?.data?.error || t("errors.create_failed")
      )
    }
  }

  const handleEventUpdate = async (updatedEvent: CalendarEvent) => {
    try {
      await updateEventMutation.mutateAsync(updatedEvent)
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>
      toast.error(
        axiosError?.response?.data?.error || t("errors.update_failed")
      )
    }
  }

  const handleEventDelete = async (eventId: string) => {
    try {
      await deleteEventMutation.mutateAsync(eventId)
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>
      toast.error(
        axiosError?.response?.data?.error || t("errors.delete_failed")
      )
    }
  }

  if (error) {
    return (
      <div className="flex flex-col rounded-md bg-white p-2">
        <div className="flex items-center justify-center p-8">
          <p className="text-sm text-red-600">
            {error?.message || t("errors.failedToLoad")}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col rounded-md bg-white p-2">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50">
          <Spinner />
        </div>
      )}
      <SimpleAgendaCalendar events={events} />
    </div>
  )
}
