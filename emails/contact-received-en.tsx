import { NotificationCategory } from "../lib/generated/prisma/enums"
import { NotificationEmail } from "../lib/mailer/templates/react/notification-email"
import { buildPreviewProps } from "./_helpers"

export default function ContactReceivedEn() {
  return (
    <NotificationEmail
      {...buildPreviewProps(NotificationCategory.CONTACT_RECEIVED, "en", {
        senderName: "Mona Ali",
        messagePreview: "Hi, I'm interested in your services...",
      })}
    />
  )
}
