"use client"

import { SettingsForm } from "./_components/settings-form"
import { useUserData } from "@/hooks/use-user-data"
import { Spinner } from "@/components/ui/spinner"
import { useTranslations } from "next-intl"

export default function SettingsPage() {
  const { data: user, isLoading, error } = useUserData()
  const t = useTranslations()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-destructive text-center">
          <p className="text-lg font-semibold">
            {t("errors.failed_to_load")}
          </p>
          <p className="text-sm">{error?.message || t("errors.user_not_found")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <SettingsForm user={user} />
    </div>
  )
}
