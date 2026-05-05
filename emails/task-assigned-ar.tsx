import { NotificationCategory } from "../lib/generated/prisma/enums"
import { NotificationEmail } from "../lib/mailer/templates/react/notification-email"
import { buildPreviewProps } from "./_helpers"

export default function TaskAssignedAr() {
  return (
    <NotificationEmail
      {...buildPreviewProps(NotificationCategory.TASK_ASSIGNED, "ar", {
        taskTitle: "تصميم قسم البطل للصفحة الرئيسية",
      })}
    />
  )
}
