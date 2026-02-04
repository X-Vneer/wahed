import { redirect } from "@/lib/i18n/navigation"
import { getLocale } from "next-intl/server"

export default async function TaskPage() {
  const locale = await getLocale()
  redirect({ href: "/tasks", locale })
}
