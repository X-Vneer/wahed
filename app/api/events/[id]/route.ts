import db from "@/lib/db"
import { updateEventSchema } from "@/lib/schemas/event"
import { transformZodError } from "@/lib/transform-errors"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"
import { getAccessTokenPayload } from "@/lib/get-access-token"
import { getReqLocale } from "@/utils/get-req-locale"
import { EventColor, UserRole } from "@/lib/generated/prisma/enums"
import { eventInclude, transformEvent } from "@/prisma/events"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // Get current user
    const payload = await getAccessTokenPayload()
    if (!payload || !payload.userId) {
      const locale = await getReqLocale(request)
      const t = await getTranslations({ locale })
      return NextResponse.json(
        { error: t("errors.unauthorized") },
        { status: 401 }
      )
    }

    const userId = payload.userId
    const { id } = await context.params

    // check if user is admin
    const isAdmin = payload.role === UserRole.ADMIN

    // Fetch event
    const event = await db.event.findUnique({
      where: { id },
      include: eventInclude,
    })

    if (!event) {
      const locale = await getReqLocale(request)
      const t = await getTranslations({ locale })
      return NextResponse.json(
        { error: t("events.errors.not_found") },
        { status: 404 }
      )
    }

    // Check if user can view this event
    // Admin can view all events
    const canView =
      isAdmin ||
      event.createdById === userId ||
      event.attendees.length === 0 || // User is creator
      event.attendees.some((attendee) => attendee.userId === userId) // User is attendee and event is not private

    if (!canView) {
      const locale = await getReqLocale(request)
      const t = await getTranslations({ locale })
      return NextResponse.json(
        { error: t("errors.forbidden") },
        { status: 403 }
      )
    }

    return NextResponse.json(transformEvent(event))
  } catch (error) {
    console.error("Error fetching event:", error)
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    // Get current user
    const payload = await getAccessTokenPayload()
    if (!payload || !payload.userId) {
      const locale = await getReqLocale(request)
      const t = await getTranslations({ locale })
      return NextResponse.json(
        { error: t("errors.unauthorized") },
        { status: 401 }
      )
    }

    const userId = payload.userId
    const { id } = await context.params

    // Get translations
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })

    // Check if event exists and user is the creator
    const existingEvent = await db.event.findUnique({
      where: { id },
      select: { id: true, createdById: true },
    })

    if (!existingEvent) {
      return NextResponse.json(
        { error: t("events.errors.not_found") },
        { status: 404 }
      )
    }

    if (existingEvent.createdById !== userId) {
      return NextResponse.json(
        { error: t("errors.forbidden") },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = updateEventSchema.safeParse(body)
    console.log("🚀 ~ PUT ~ validationResult:", validationResult)

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

    // Validate that end date is after start date if both are provided
    if (data.start && data.end && data.end < data.start) {
      return NextResponse.json(
        {
          error: t("events.errors.end_before_start"),
          details: {
            end: t("events.errors.end_before_start"),
          },
        },
        { status: 400 }
      )
    }

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

    // Update event
    const event = await db.event.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && {
          description: data.description || null,
        }),
        ...(data.start !== undefined && { start: data.start }),
        ...(data.end !== undefined && { end: data.end }),
        ...(data.allDay !== undefined && { allDay: data.allDay }),
        ...(data.color !== undefined && { color: data.color as EventColor }),
        ...(data.location !== undefined && { location: data.location || null }),
        // Handle attendees update
        ...(data.attendeeIds !== undefined && {
          attendees: {
            deleteMany: {}, // Remove all existing attendees
            create: data.attendeeIds.map((attendeeId: string) => ({
              userId: attendeeId,
            })),
          },
        }),
      },
      include: eventInclude,
    })

    return NextResponse.json(transformEvent(event))
  } catch (error) {
    console.error("Error updating event:", error)
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    // Get current user
    const payload = await getAccessTokenPayload()
    if (!payload || !payload.userId) {
      const locale = await getReqLocale(request)
      const t = await getTranslations({ locale })
      return NextResponse.json(
        { error: t("errors.unauthorized") },
        { status: 401 }
      )
    }

    const userId = payload.userId
    const { id } = await context.params

    // Get translations
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })

    // Check if user is admin
    const currentUser = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    const isAdmin = currentUser?.role === UserRole.ADMIN

    // Check if event exists and user is the creator or admin
    const existingEvent = await db.event.findUnique({
      where: { id },
      select: { id: true, createdById: true },
    })

    if (!existingEvent) {
      return NextResponse.json(
        { error: t("events.errors.not_found") },
        { status: 404 }
      )
    }

    if (!isAdmin && existingEvent.createdById !== userId) {
      return NextResponse.json(
        { error: t("errors.forbidden") },
        { status: 403 }
      )
    }

    // Delete event (cascade will handle attendees)
    await db.event.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting event:", error)
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
