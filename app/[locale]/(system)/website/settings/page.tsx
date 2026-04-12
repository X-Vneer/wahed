"use client"

import { WebsiteSettingsForm } from "@/app/[locale]/(system)/website/settings/_components/website-settings-form"
import PageLoader from "@/components/page-loader"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useWebsiteSiteSettings } from "@/hooks/use-website-site-settings"
import type { WebsiteSiteSettingsFormValues } from "@/lib/schemas/website-site-settings"
import { useTranslations } from "next-intl"

export default function WebsiteSettingsPage() {
  const t = useTranslations("websiteCms.settings")
  const { settings, isLoading, updatePartial, isUpdating } =
    useWebsiteSiteSettings()

  const save = async (values: WebsiteSiteSettingsFormValues): Promise<void> => {
    await updatePartial(values)
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

      <WebsiteSettingsForm
        settings={settings}
        isLoading={isLoading || isUpdating}
        onSave={save}
      />
    </div>
  )
}
