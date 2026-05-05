import db from "@/lib/db"
import { NotificationCategory } from "@/lib/generated/prisma/enums"
import { initLocale, validateRequest } from "@/utils"
import { createNotifications, getAdminUserIds } from "@/lib/notifications"
import { createContactMessageSchema } from "@/schemas/contact"
import { type NextRequest, NextResponse } from "next/server"

/**
 * Public endpoint — no authentication required.
 * Receives contact form submissions from the website.
 */
export async function POST(request: NextRequest) {
  const { t } = await initLocale(request)

  try {
    const body = await request.json()
    const validation = validateRequest(createContactMessageSchema, body, t)
    if (validation.error) return validation.error
    const data = validation.data

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
          category: NotificationCategory.CONTACT_RECEIVED,
          messageParams: {
            senderName: `${data.firstName} ${data.lastName}`,
            messagePreview: data.message.substring(0, 100),
          },
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
