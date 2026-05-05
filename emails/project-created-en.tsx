import { NotificationCategory } from "../lib/generated/prisma/enums"
import { NotificationEmail } from "../lib/mailer/templates/react/notification-email"
import { buildPreviewProps } from "./_helpers"

export default function ProjectCreatedEn() {
  return (
    <NotificationEmail
      {...buildPreviewProps(NotificationCategory.PROJECT_CREATED, "en", {
        projectName: "Wahd Tower — Phase 2",
      })}
    />
  )
}
