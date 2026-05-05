import { NotificationCategory } from "../lib/generated/prisma/enums"
import { NotificationEmail } from "../lib/mailer/templates/react/notification-email"
import { buildPreviewProps } from "./_helpers"

export default function ContactReceivedAr() {
  return (
    <NotificationEmail
      {...buildPreviewProps(NotificationCategory.CONTACT_RECEIVED, "ar", {
        senderName: "منى علي",
        messagePreview: "مرحباً، أنا مهتم بخدماتكم...",
      })}
    />
  )
}
