"use client"

import {
  addDays,
  addWeeks,
  endOfWeek,
  format,
  isToday,
  startOfWeek,
} from "date-fns"
import { ar, enUS } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useMemo, useState } from "react"

import {
  CalendarEvent,
  EventItem,
  getAgendaEventsForDay,
} from "@/components/event-calendar"
import { Button } from "@/components/ui/button"
import { RiCalendarEventLine } from "@remixicon/react"

interface SimpleAgendaCalendarProps {
  events?: CalendarEvent[]
  className?: string
  initialDate?: Date
}

export function SimpleAgendaCalendar({
  events = [],
  className,
  initialDate,
}: SimpleAgendaCalendarProps) {
  const t = useTranslations("calendar")
  const locale = useLocale()
  const dateFnsLocale = locale === "ar" ? ar : enUS
  const [currentDate, setCurrentDate] = useState(initialDate || new Date())

  const handlePrevious = () => {
    setCurrentDate((prev) => addWeeks(prev, -1))
  }

  const handleNext = () => {
    setCurrentDate((prev) => addWeeks(prev, 1))
  }

  // Get week start and end dates
  const weekStart = useMemo(
    () => startOfWeek(currentDate, { weekStartsOn: 6 }),
    [currentDate]
  )

  const weekEnd = useMemo(
    () => endOfWeek(currentDate, { weekStartsOn: 6 }),
    [currentDate]
  )

  const viewTitle = useMemo(() => {
    return `${format(weekStart, "dd MMM", { locale: dateFnsLocale })} - ${format(weekEnd, "dd MMM yyyy", { locale: dateFnsLocale })}`
  }, [weekStart, weekEnd, dateFnsLocale])

  // Show events for the week (7 days)
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(new Date(weekStart), i))
  }, [weekStart])

  // Check if there are any days with events
  const hasEvents = days.some(
    (day) => getAgendaEventsForDay(events, day).length > 0
  )

  return (
    <div className={`flex flex-col ${className || ""}`}>
      {/* Header with navigation */}
      <div className="flex items-center justify-between p-2 sm:p-4">
        <div className="flex items-center gap-1 sm:gap-4">
          <div className="flex items-center sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              aria-label="Previous"
            >
              <ChevronLeft
                className="rtl:rotate-180"
                size={16}
                aria-hidden="true"
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              aria-label="Next"
            >
              <ChevronRight
                className="rtl:rotate-180"
                size={16}
                aria-hidden="true"
              />
            </Button>
          </div>
          <h2 className="text-sm font-semibold">{viewTitle}</h2>
        </div>
      </div>

      {/* Agenda content */}
      <div className="border-border/70 border-t px-4">
        {!hasEvents ? (
          <div className="flex min-h-[70svh] flex-col items-center justify-center py-16 text-center">
            <RiCalendarEventLine
              size={32}
              className="text-muted-foreground/50 mb-2"
            />
            <h3 className="text-lg font-medium">{t("noEventsFound")}</h3>
            <p className="text-muted-foreground">{t("noEventsScheduled")}</p>
          </div>
        ) : (
          days.map((day) => {
            const dayEvents = getAgendaEventsForDay(events, day)

            if (dayEvents.length === 0) return null

            return (
              <div
                key={day.toString()}
                className="border-border/70 relative my-12 border-t"
              >
                <span
                  className="bg-background absolute -top-3 left-0 flex h-6 items-center pe-4 text-[10px] uppercase data-today:font-medium sm:pe-4 sm:text-xs"
                  data-today={isToday(day) || undefined}
                >
                  {format(day, "d MMM, EEEE", { locale: dateFnsLocale })}
                </span>
                <div className="mt-6 space-y-2">
                  {dayEvents.map((event) => (
                    <EventItem
                      key={event.id}
                      event={event}
                      view="agenda"
                      onClick={() => {
                        // No-op: events are not clickable in simple view
                      }}
                    />
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
