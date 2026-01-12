import db from "@/lib/db"
import { createEventSchema } from "@/lib/schemas/event"
import { transformZodError } from "@/lib/transform-errors"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"
import { getAccessTokenPayload } from "@/lib/get-access-token"
import { getReqLocale } from "@/utils/get-req-locale"
import { EventColor, UserRole } from "@/lib/generated/prisma/enums"
import { eventInclude, transformEvent } from "@/prisma/events"

export async function GET(request: NextRequest) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })
  try {
    // Get current user
    const payload = await getAccessTokenPayload()
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: t("errors.unauthorized") },
        { status: 401 }
      )
    }

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
    const transformedEvents = events.map((event) => transformEvent(event))

    return NextResponse.json({ events: transformedEvents })
  } catch (error) {
    console.error("Error fetching events:", error)

    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })
  try {
    // Get current user
    const payload = await getAccessTokenPayload()
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: t("errors.unauthorized") },
        { status: 401 }
      )
    }

    const userId = payload.userId

    // Parse and validate request body
    const body = await request.json()
    const validationResult = createEventSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: transformZodError(validationResult.error),
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

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
    const event = await db.event.create({
      data: {
        title: data.title,
        description: data.description || null,
        start: data.start,
        end: data.end,
        allDay: data.allDay ?? false,
        color: (data.color || "SKY") as EventColor,
        location: data.location || null,
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
