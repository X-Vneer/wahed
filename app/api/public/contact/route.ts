import db from "@/lib/db"
import { createNotifications, getAdminUserIds } from "@/lib/notifications"
import { createContactMessageSchema } from "@/lib/schemas/contact"
import { transformZodError } from "@/lib/transform-errors"
import { getReqLocale } from "@/utils/get-req-locale"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"

/**
 * Public endpoint — no authentication required.
 * Receives contact form submissions from the website.
 */
export async function POST(request: NextRequest) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })

  try {
    const body = await request.json()
    const validationResult = createContactMessageSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: t("errors.validation_failed"),
          details: transformZodError(validationResult.error),
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    const contact = await db.contactMessage.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        message: data.message,
        source: data.source,
        projectSlug: data.projectSlug,
      },
    })

    // Notify all admins about new contact message
    getAdminUserIds().then((adminIds) => {
      if (adminIds.length > 0) {
        createNotifications({
          userIds: adminIds,
          type: "CONTACT_RECEIVED",
          title: "New Contact Message",
          message: `${data.firstName} ${data.lastName}: ${data.message.substring(0, 100)}`,
          relatedId: contact.id,
          relatedType: "contact",
        })
      }
    })

    return NextResponse.json(
      { message: t("contacts.success.created") },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating contact message:", error)
    return NextResponse.json(
      { error: t("errors.internal_server_error") },
      { status: 500 }
    )
  }
}
