"use client"

import PageLoader from "@/components/page-loader"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useSystemSiteSettings } from "@/hooks/use-system-site-settings"
import type { SystemSiteSettingsFormValues } from "@/schemas/system-site-settings"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { SystemSettingsForm } from "./_components/system-settings-form"

export default function SystemSettingsPage() {
  const t = useTranslations("systemSettings")
  const router = useRouter()
  const { settings, isLoading, updatePartial, isUpdating } =
    useSystemSiteSettings()

  const save = async (values: SystemSiteSettingsFormValues): Promise<void> => {
    await updatePartial(values)
    router.refresh()
  }

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-1">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            {t("pageTitle")}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            {t("pageDescription")}
          </CardDescription>
        </CardHeader>
      </Card>

      <SystemSettingsForm
        settings={settings}
        isLoading={isLoading || isUpdating}
        onSave={save}
      />
    </div>
  )
}
