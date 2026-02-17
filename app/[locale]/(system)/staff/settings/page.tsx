"use client"

import { StaffPageSettingsForm } from "./_components/staff-page-settings-form"
import { usePermission } from "@/hooks/use-permission"
import { PERMISSIONS_GROUPED } from "@/config"
import { useTranslations } from "next-intl"

export default function StaffSettingsPage() {
  const { checkPermission, isLoading } = usePermission()
  const t = useTranslations()

  const canManage = checkPermission(PERMISSIONS_GROUPED.STAFF_PAGE.MANAGEMENT)

  if (isLoading) {
    return null
  }

  if (!canManage) {
    return (
      <div className="border-destructive/50 bg-destructive/10 text-destructive rounded-lg border p-4">
        {t("errors.forbidden")}
      </div>
    )
  }

  return <StaffPageSettingsForm />
}
