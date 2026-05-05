"use client"

import { PERMISSIONS } from "@/config/permissions"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePermission } from "@/hooks/use-permission"
import { usePathname, useRouter } from "@/lib/i18n/navigation"
import { useTranslations } from "next-intl"

export default function StaffTabs() {
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations("sidebar")
  const { checkPermission } = usePermission()

  const canViewTasks = checkPermission(PERMISSIONS.TASK_VIEW)
  const canViewProjects = checkPermission(PERMISSIONS.PROJECT_VIEW)

  return (
    <Tabs
      className="items-center overflow-hidden rounded-t-lg"
      defaultValue="/"
      value={pathname}
      onValueChange={(value) => {
        router.push(value)
      }}
    >
      <TabsList variant={"line"} className="h-auto bg-white p-0 px-2">
        <TabsTrigger className={"px-3"} value="/">
          {t("home")}
        </TabsTrigger>
        {canViewTasks && (
          <TabsTrigger className={"px-3"} value="/tasks">
            {t("tasks")}
          </TabsTrigger>
        )}
        {canViewProjects && (
          <TabsTrigger className={"px-3"} value="/projects">
            {t("projects")}
          </TabsTrigger>
        )}
        <TabsTrigger className={"px-3"} value="/calendar">
          {t("calendar")}
        </TabsTrigger>
        <TabsTrigger className={"px-3"} value="/settings">
          {t("settings")}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
