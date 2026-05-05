import { NotificationCategory } from "../lib/generated/prisma/enums"
import { NotificationEmail } from "../lib/mailer/templates/react/notification-email"
import { buildPreviewProps } from "./_helpers"

export default function EventInvitedEn() {
  return (
    <NotificationEmail
      {...buildPreviewProps(NotificationCategory.EVENT_INVITED, "en", {
        eventTitle: "Quarterly review",
      })}
    />
  )
}
