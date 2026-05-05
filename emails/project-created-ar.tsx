import { NotificationCategory } from "../lib/generated/prisma/enums"
import { NotificationEmail } from "../lib/mailer/templates/react/notification-email"
import { buildPreviewProps } from "./_helpers"

export default function ProjectCreatedAr() {
  return (
    <NotificationEmail
      {...buildPreviewProps(NotificationCategory.PROJECT_CREATED, "ar", {
        projectName: "برج وهد — المرحلة الثانية",
      })}
    />
  )
}
