import db from "@/lib/db"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"
import { getAccessTokenPayload } from "@/lib/get-access-token"
import { getReqLocale } from "@/utils/get-req-locale"
import { UserRole } from "@/lib/generated/prisma/enums"
import { z } from "zod/v4"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

const addAttendeeSchema = z.object({
  userId: z.string().min(1),
})

export async function POST(request: NextRequest, context: RouteContext) {
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
    const { id: eventId } = await context.params

    // Get translations
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })

    // Check if user is admin
    const isAdmin = payload.role === UserRole.ADMIN
    // Parse and validate request body
    const body = await request.json()
    const validationResult = addAttendeeSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: "userId is required",
        },
        { status: 400 }
      )
    }

    const { userId: attendeeId } = validationResult.data

    // Check if event exists
    const event = await db.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        createdById: true,
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: t("events.errors.not_found") },
        { status: 404 }
      )
    }

    // Only creator or admin can add attendees
    if (!isAdmin && event.createdById !== userId) {
      return NextResponse.json(
        { error: t("errors.forbidden") },
        { status: 403 }
      )
    }

    // Validate that the user to add exists and is active
    const attendee = await db.user.findUnique({
      where: {
        id: attendeeId,
        isActive: true,
      },
      select: { id: true },
    })

    if (!attendee) {
      return NextResponse.json(
        { error: t("events.errors.invalid_attendee") },
        { status: 404 }
      )
    }

    // Check if attendee already exists
    const existingAttendee = await db.eventAttendee.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: attendeeId,
        },
      },
    })

    if (existingAttendee) {
      return NextResponse.json(
        { error: t("events.errors.attendee_already_added") },
        { status: 400 }
      )
    }

    // Add attendee
    const eventAttendee = await db.eventAttendee.create({
      data: {
        eventId,
        userId: attendeeId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        id: eventAttendee.user.id,
        name: eventAttendee.user.name,
        email: eventAttendee.user.email,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error adding attendee:", error)
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  // Get translations
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
    const { id: eventId } = await context.params

    // check if user is admin
    const isAdmin = payload.role === UserRole.ADMIN

    // Get attendee ID from query params
    const searchParams = request.nextUrl.searchParams
    const attendeeId = searchParams.get("userId")

    if (!attendeeId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 }
      )
    }

    // Check if event exists
    const event = await db.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        createdById: true,
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: t("events.errors.not_found") },
        { status: 404 }
      )
    }

    // Only creator or admin can remove attendees (or the attendee themselves)
    if (!isAdmin && event.createdById !== userId && attendeeId !== userId) {
      return NextResponse.json(
        { error: t("errors.forbidden") },
        { status: 403 }
      )
    }

    // Check if attendee exists
    const existingAttendee = await db.eventAttendee.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: attendeeId,
        },
      },
    })

    if (!existingAttendee) {
      return NextResponse.json(
        { error: t("events.errors.attendee_not_found") },
        { status: 404 }
      )
    }

    // Remove attendee
    await db.eventAttendee.delete({
      where: {
        eventId_userId: {
          eventId,
          userId: attendeeId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing attendee:", error)
    const locale = await getReqLocale(request)
    const t = await getTranslations({ locale })
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
