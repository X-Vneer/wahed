import { NotificationCategory } from "../lib/generated/prisma/enums"
import { NotificationEmail } from "../lib/mailer/templates/react/notification-email"
import { buildPreviewProps } from "./_helpers"

export default function TaskCommentedEn() {
  return (
    <NotificationEmail
      {...buildPreviewProps(NotificationCategory.TASK_COMMENTED, "en", {
        taskTitle: "Design landing hero section",
        userName: "Sarah Ahmed",
        comment: "Looks great — ready for review.",
      })}
    />
  )
}
