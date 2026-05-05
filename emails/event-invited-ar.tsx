import { NotificationCategory } from "../lib/generated/prisma/enums"
import { NotificationEmail } from "../lib/mailer/templates/react/notification-email"
import { buildPreviewProps } from "./_helpers"

export default function EventInvitedAr() {
  return (
    <NotificationEmail
      {...buildPreviewProps(NotificationCategory.EVENT_INVITED, "ar", {
        eventTitle: "المراجعة الربع سنوية",
      })}
    />
  )
}
