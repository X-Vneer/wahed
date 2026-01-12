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
    createdBy: event.createdBy,
    attendees: event.attendees.map((attendee) => attendee.user),
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  }
}
export type Event = ReturnType<typeof transformEvent>
