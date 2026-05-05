import { NotificationCategory } from "../lib/generated/prisma/enums"
import { NotificationEmail } from "../lib/mailer/templates/react/notification-email"
import { buildPreviewProps } from "./_helpers"

export default function TaskCommentedAr() {
  return (
    <NotificationEmail
      {...buildPreviewProps(NotificationCategory.TASK_COMMENTED, "ar", {
        taskTitle: "تصميم قسم البطل للصفحة الرئيسية",
        userName: "سارة أحمد",
        comment: "يبدو رائعاً — جاهز للمراجعة.",
      })}
    />
  )
}
