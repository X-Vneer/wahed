import { NotificationCategory } from "../lib/generated/prisma/enums"
import { NotificationEmail } from "../lib/mailer/templates/react/notification-email"
import { buildPreviewProps } from "./_helpers"

export default function TaskAssignedEn() {
  return (
    <NotificationEmail
      {...buildPreviewProps(NotificationCategory.TASK_ASSIGNED, "en", {
        taskTitle: "Design landing hero section",
      })}
    />
  )
}
