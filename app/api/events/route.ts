import db from "@/lib/db"
import { createEventSchema } from "@/schemas/event"
import { type NextRequest, NextResponse } from "next/server"
import { initLocale, requireAuth, validateRequest } from "@/utils"
import {
  EventColor,
  NotificationCategory,
  UserRole,
} from "@/lib/generated/prisma/enums"
import { createNotifications, getAdminUserIds } from "@/lib/notifications"
import {
  eventInclude,
  transformEvent,
  type EventInclude,
} from "@/prisma/events"
import { expandRecurringEvents } from "@/utils/recurrence"
import type { CalendarEvent } from "@/components/event-calendar"
import { Prisma } from "@/lib/generated/prisma/client"

export async function GET(request: NextRequest) {
  const { t } = await initLocale(request)
  try {
    // Get current user
    const auth = await requireAuth(t)
    if (auth.error) return auth.error
    const { payload } = auth

    const userId = payload.userId
    // check if user is admin
    const isAdmin = payload.role === UserRole.ADMIN

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("start")
    const endDate = searchParams.get("end")

    // Build date filter for events that overlap with the date range
    // An event overlaps if: start <= endDate AND end >= startDate
    const dateFilter: {
      AND?: Array<{
        start?: { lte?: Date }
        end?: { gte?: Date }
      }>
    } = {}

    if (startDate && endDate) {
      dateFilter.AND = [
        { start: { lte: new Date(endDate) } },
        { end: { gte: new Date(startDate) } },
      ]
    } else if (startDate) {
      dateFilter.AND = [{ end: { gte: new Date(startDate) } }]
    } else if (endDate) {
      dateFilter.AND = [{ start: { lte: new Date(endDate) } }]
    }

    // Fetch events that the user can see:
    // Admin: All events
    // Regular user:
    //   1. Events created by the user
    //   2. Public events (isPublic = true)
    //   3. Events where user is an attendee (and not private)
    const events = await db.event.findMany({
      where: {
        AND: [
          // For admins, don't filter by visibility - they see all events
          // For regular users, apply visibility filters
          ...(isAdmin
            ? []
            : [
                {
                  OR: [
                    // User's own events
                    { createdById: userId },
                    // Events with no attendees or where user is an attendee
                    {
                      OR: [
                        { attendees: { none: {} } },
                        {
                          attendees: {
                            some: {
                              userId: userId,
                            },
                          },
                        },
                      ],
                    },
                  ],
                },
              ]),
          // Apply date filter if provided
          ...(Object.keys(dateFilter).length > 0 ? [dateFilter] : []),
        ],
      },
      include: eventInclude,
      orderBy: {
        start: "asc",
      },
    })

    // Transform events to match CalendarEvent format
    const transformedEvents = events.map((event) => {
      const transformed = transformEvent(event)
      return {
        ...transformed,
        description: transformed.description ?? undefined,
        location: transformed.location ?? undefined,
        color: transformed.color as CalendarEvent["color"],
        recurrenceEndDate: transformed.recurrenceEndDate ?? undefined,
      }
    })

    // Expand recurring events into instances
    const startDateForExpansion = startDate ? new Date(startDate) : new Date()
    const endDateForExpansion = endDate
      ? new Date(endDate)
      : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // Default to 3 months ahead

    const expandedEvents = expandRecurringEvents(
      transformedEvents,
      startDateForExpansion,
      endDateForExpansion
    )

    return NextResponse.json({ events: expandedEvents })
  } catch (error) {
    console.error("Error fetching events:", error)

    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const { t } = await initLocale(request)
  try {
    // Get current user
    const auth = await requireAuth(t)
    if (auth.error) return auth.error
    const { payload } = auth

    const userId = payload.userId

    // Parse and validate request body
    const body = await request.json()
    const validation = validateRequest(createEventSchema, body, t)
    if (validation.error) return validation.error
    const data = validation.data

    // Validate attendee IDs if provided
    if (data.attendeeIds && data.attendeeIds.length > 0) {
      const attendees = await db.user.findMany({
        where: {
          id: { in: data.attendeeIds },
          isActive: true,
        },
        select: { id: true },
      })

      if (attendees.length !== data.attendeeIds.length) {
        return NextResponse.json(
          {
            error: t("events.errors.invalid_attendees"),
            details: {
              attendeeIds: t("events.errors.invalid_attendees"),
            },
          },
          { status: 400 }
        )
      }
    }

    // Create event with attendees
    const event: EventInclude = await db.event.create({
      data: {
        title: data.title,
        description: data.description || null,
        start: data.start,
        end: data.end,
        allDay: data.allDay ?? false,
        color: (data.color || "SKY") as EventColor,
        location: data.location || null,
        isRecurring: data.isRecurring ?? false,
        recurrenceRule: data.recurrenceRule
          ? (data.recurrenceRule as Prisma.InputJsonValue)
          : undefined,
        recurrenceEndDate: data.recurrenceEndDate || undefined,
        createdById: userId,
        attendees:
          data.attendeeIds && data.attendeeIds.length > 0
            ? {
                create: data.attendeeIds.map((attendeeId: string) => ({
                  userId: attendeeId,
                })),
              }
            : undefined,
      },
      include: eventInclude,
    })

    // Notify attendees they were invited (excluding the creator).
    const inviteeIds = (data.attendeeIds ?? []).filter((id) => id !== userId)
    if (inviteeIds.length > 0) {
      await createNotifications({
        userIds: inviteeIds,
        category: NotificationCategory.EVENT_INVITED,
        messageParams: { eventTitle: event.title },
        relatedId: event.id,
        relatedType: "event",
      })
    }

    // Notify admins that a new event was created (excluding the creator).
    const adminIds = (await getAdminUserIds()).filter(
      (id) => id !== userId && !inviteeIds.includes(id)
    )
    if (adminIds.length > 0) {
      await createNotifications({
        userIds: adminIds,
        category: NotificationCategory.EVENT_CREATED,
        messageParams: { eventTitle: event.title },
        relatedId: event.id,
        relatedType: "event",
      })
    }

    // Transform event to match CalendarEvent format
    const transformedEvent = transformEvent(event)

    return NextResponse.json(transformedEvent, { status: 201 })
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
