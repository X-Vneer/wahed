"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

import { SimpleAgendaCalendar } from "@/components/event-calendar"
import { Spinner } from "@/components/ui/spinner"
import { useEvents } from "@/hooks/use-events"

export default function WeeklySchedule() {
  const t = useTranslations("calendar")
  const [currentDate] = useState(new Date())

  // Fetch events - we fetch 3 months of data to cover all views
  const { data: events = [], isLoading, error } = useEvents(currentDate)

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
