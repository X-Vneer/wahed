"use client"

import { useMemo } from "react"
import type { DraggableAttributes } from "@dnd-kit/core"
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities"
import {
  differenceInMinutes,
  format,
  getMinutes,
  isPast,
  isSameDay,
} from "date-fns"
import { ar, enUS, type Locale } from "date-fns/locale"
import { useLocale, useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import {
  getBorderRadiusClasses,
  getEventColorClasses,
  getEventBorderColorClasses,
  type CalendarEvent,
} from "@/components/event-calendar"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import UserAvatar from "../user-avatar"

// Using date-fns format with custom formatting:
// 'h' - hours (1-12)
// 'a' - am/pm
// ':mm' - minutes with leading zero (only if the token 'mm' is present)
const formatTimeWithOptionalMinutes = (date: Date, locale: Locale = enUS) => {
  return format(date, getMinutes(date) === 0 ? "ha" : "h:mma", {
    locale,
  }).toLowerCase()
}

interface EventWrapperProps {
  event: CalendarEvent
  isFirstDay?: boolean
  isLastDay?: boolean
  isDragging?: boolean
  onClick?: (e: React.MouseEvent) => void
  className?: string
  children: React.ReactNode
  currentTime?: Date
  dndListeners?: SyntheticListenerMap
  dndAttributes?: DraggableAttributes
  onMouseDown?: (e: React.MouseEvent) => void
  onTouchStart?: (e: React.TouchEvent) => void
}

// Helper component to render hover card content
function EventHoverCardContent({
  event,
  displayStart,
  displayEnd,
  dateFnsLocale,
}: {
  event: CalendarEvent
  displayStart: Date
  displayEnd: Date
  dateFnsLocale: Locale
}) {
  const t = useTranslations("calendar")
  const formatDate = (date: Date) => {
    return format(date, "PPp", { locale: dateFnsLocale })
  }

  const formatTime = (date: Date) => {
    return formatTimeWithOptionalMinutes(date, dateFnsLocale)
  }

  return (
    <div className="space-y-2">
      <div className="font-semibold">{event.title}</div>
      <div className="text-muted-foreground space-y-1 text-sm">
        {event.allDay ? (
          <div>
            <span className="font-medium">{t("allDay")}</span>
            <div className="text-xs text-gray-600">
              {format(displayStart, "PP", { locale: dateFnsLocale })}
              {!isSameDay(displayStart, displayEnd) &&
                ` - ${format(displayEnd, "PP", { locale: dateFnsLocale })}`}
            </div>
          </div>
        ) : (
          <div>
            <div className="font-medium">
              {formatTime(displayStart)} - {formatTime(displayEnd)}
            </div>
            <div className="text-sm text-gray-600">
              {formatDate(displayStart)}
            </div>
          </div>
        )}
        {event.location && (
          <div className="pt-1">
            <span className="font-medium">{t("location")}: </span>
            <span>{event.location}</span>
          </div>
        )}
        {event.description && (
          <div className="pt-1 text-sm text-gray-950">{event.description}</div>
        )}
        {event.attendees &&
          event.attendees.length > 0 &&
          event.attendees.map((attendee) => (
            <UserAvatar key={attendee.id} {...attendee} />
          ))}
      </div>
    </div>
  )
}

// Shared wrapper component for event styling
function EventWrapper({
  event,
  isFirstDay = true,
  isLastDay = true,
  isDragging,
  onClick,
  className,
  children,
  currentTime,
  dndListeners,
  dndAttributes,
  onMouseDown,
  onTouchStart,
  showHoverCard = true,
  hoverCardContent,
}: EventWrapperProps & {
  showHoverCard?: boolean
  hoverCardContent?: React.ReactNode
}) {
  // Always use the currentTime (if provided) to determine if the event is in the past
  const displayEnd = currentTime
    ? new Date(
        new Date(currentTime).getTime() +
          (new Date(event.end).getTime() - new Date(event.start).getTime())
      )
    : new Date(event.end)

  const isEventInPast = isPast(displayEnd)

  const buttonContent = (
    <button
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 flex h-full w-full overflow-hidden border-l-4 px-1 text-left font-medium backdrop-blur-md transition outline-none select-none focus-visible:ring-[3px] data-dragging:cursor-grabbing data-dragging:shadow-lg data-past-event:line-through sm:px-2",
        getEventColorClasses(event.color),
        getEventBorderColorClasses(event.color),
        getBorderRadiusClasses(isFirstDay, isLastDay),
        className
      )}
      data-dragging={isDragging || undefined}
      data-past-event={isEventInPast || undefined}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      {...dndListeners}
      {...dndAttributes}
    >
      {children}
    </button>
  )

  if (!showHoverCard || isDragging) {
    return buttonContent
  }

  return (
    <HoverCard>
      <HoverCardTrigger>{buttonContent}</HoverCardTrigger>
      <HoverCardContent>{hoverCardContent}</HoverCardContent>
    </HoverCard>
  )
}

interface EventItemProps {
  event: CalendarEvent
  view: "month" | "week" | "day" | "agenda"
  isDragging?: boolean
  onClick?: (e: React.MouseEvent) => void
  showTime?: boolean
  currentTime?: Date // For updating time during drag
  isFirstDay?: boolean
  isLastDay?: boolean
  children?: React.ReactNode
  className?: string
  dndListeners?: SyntheticListenerMap
  dndAttributes?: DraggableAttributes
  onMouseDown?: (e: React.MouseEvent) => void
  onTouchStart?: (e: React.TouchEvent) => void
}

export function EventItem({
  event,
  view,
  isDragging,
  onClick,
  showTime,
  currentTime,
  isFirstDay = true,
  isLastDay = true,
  children,
  className,
  dndListeners,
  dndAttributes,
  onMouseDown,
  onTouchStart,
}: EventItemProps) {
  const t = useTranslations("calendar")
  const locale = useLocale()
  const dateFnsLocale = locale === "ar" ? ar : enUS
  const eventColor = event.color

  // Use the provided currentTime (for dragging) or the event's actual time
  const displayStart = useMemo(() => {
    return currentTime || new Date(event.start)
  }, [currentTime, event.start])

  const displayEnd = useMemo(() => {
    return currentTime
      ? new Date(
          new Date(currentTime).getTime() +
            (new Date(event.end).getTime() - new Date(event.start).getTime())
        )
      : new Date(event.end)
  }, [currentTime, event.start, event.end])

  // Calculate event duration in minutes
  const durationMinutes = useMemo(() => {
    return differenceInMinutes(displayEnd, displayStart)
  }, [displayStart, displayEnd])

  const getEventTime = () => {
    if (event.allDay) return t("allDay")

    // For short events (less than 45 minutes), only show start time
    if (durationMinutes < 45) {
      return formatTimeWithOptionalMinutes(displayStart, dateFnsLocale)
    }

    // For longer events, show both start and end time
    return `${formatTimeWithOptionalMinutes(displayStart, dateFnsLocale)} - ${formatTimeWithOptionalMinutes(displayEnd, dateFnsLocale)}`
  }

  const hoverCardContent = (
    <EventHoverCardContent
      event={event}
      displayStart={displayStart}
      displayEnd={displayEnd}
      dateFnsLocale={dateFnsLocale}
    />
  )

  if (view === "month") {
    return (
      <EventWrapper
        event={event}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        isDragging={isDragging}
        onClick={onClick}
        className={cn(
          "mt-[var(--event-gap)] h-[var(--event-height)] items-center text-[10px] sm:text-xs",
          className
        )}
        currentTime={currentTime}
        dndListeners={dndListeners}
        dndAttributes={dndAttributes}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        hoverCardContent={hoverCardContent}
      >
        {children || (
          <span className="truncate">
            {!event.allDay && (
              <span className="truncate font-normal opacity-70 sm:text-[11px]">
                {formatTimeWithOptionalMinutes(
                  displayStart,
                  dateFnsLocale
                )}{" "}
              </span>
            )}
            {event.title}
          </span>
        )}
      </EventWrapper>
    )
  }

  if (view === "week" || view === "day") {
    return (
      <EventWrapper
        event={event}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        isDragging={isDragging}
        onClick={onClick}
        className={cn(
          "py-1",
          durationMinutes < 45 ? "items-center" : "flex-col",
          view === "week" ? "text-[10px] sm:text-xs" : "text-xs",
          className
        )}
        currentTime={currentTime}
        dndListeners={dndListeners}
        dndAttributes={dndAttributes}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        hoverCardContent={hoverCardContent}
      >
        {durationMinutes < 45 ? (
          <div className="truncate">
            {event.title}{" "}
            {showTime && (
              <span className="opacity-70">
                {formatTimeWithOptionalMinutes(displayStart, dateFnsLocale)}
              </span>
            )}
          </div>
        ) : (
          <>
            <div className="truncate font-medium">{event.title}</div>
            {showTime && (
              <div className="truncate font-normal opacity-70 sm:text-[11px]">
                {getEventTime()}
              </div>
            )}
          </>
        )}
      </EventWrapper>
    )
  }

  // Agenda view - kept separate since it's significantly different
  const agendaButton = (
    <button
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 flex w-full flex-col gap-1 rounded border-l-4 p-2 text-left transition outline-none focus-visible:ring-[3px] data-past-event:line-through data-past-event:opacity-90",
        getEventColorClasses(eventColor),
        getEventBorderColorClasses(eventColor),
        className
      )}
      data-past-event={isPast(new Date(event.end)) || undefined}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      {...dndListeners}
      {...dndAttributes}
    >
      <div className="text-sm font-medium">{event.title}</div>
      <div className="text-xs opacity-70">
        {event.allDay ? (
          <span>{t("allDay")}</span>
        ) : (
          <span className="uppercase">
            {formatTimeWithOptionalMinutes(displayStart, dateFnsLocale)} -{" "}
            {formatTimeWithOptionalMinutes(displayEnd, dateFnsLocale)}
          </span>
        )}
        {event.location && (
          <>
            <span className="px-1 opacity-35"> · </span>
            <span>{event.location}</span>
          </>
        )}
      </div>
      {event.description && (
        <div className="my-1 text-xs opacity-90">{event.description}</div>
      )}
    </button>
  )

  if (isDragging) {
    return agendaButton
  }

  return (
    <HoverCard>
      <HoverCardTrigger>{agendaButton}</HoverCardTrigger>
      <HoverCardContent>{hoverCardContent}</HoverCardContent>
    </HoverCard>
  )
}
