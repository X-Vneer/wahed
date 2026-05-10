import type { Prisma } from "@/lib/generated/prisma/client"

export const eventInclude = {
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  attendees: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  },
  externalAttendees: {
    select: {
      id: true,
      email: true,
    },
  },
} satisfies Prisma.EventInclude

export type EventInclude = Prisma.EventGetPayload<{
  include: typeof eventInclude
}>

export const transformEvent = (event: EventInclude) => {
  return {
    id: event.id,
    color: event.color.toLowerCase(),
    title: event.title,
    description: event.description,
    start: event.start,
    end: event.end,
    allDay: event.allDay,
    location: event.location,
    meetingUrl: event.meetingUrl,
    createdBy: event.createdBy,
    attendees: event.attendees.map((attendee) => attendee.user),
    externalAttendees: event.externalAttendees.map((a) => ({
      id: a.id,
      email: a.email,
    })),
    externalAttendeeEmails: event.externalAttendees.map((a) => a.email),
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
    // Recurrence fields
    isRecurring: event.isRecurring ?? false,
    recurrenceRule: event.recurrenceRule
      ? typeof event.recurrenceRule === "string"
        ? JSON.parse(event.recurrenceRule)
        : event.recurrenceRule
      : null,
    recurrenceEndDate: event.recurrenceEndDate,
  }
}
export type Event = ReturnType<typeof transformEvent>
