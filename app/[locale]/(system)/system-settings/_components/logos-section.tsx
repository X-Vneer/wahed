"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { UseFormReturnType } from "@mantine/form"
import { ImageIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import type { FormModel } from "./form-model"
import { LogoUploadSlot } from "./logo-upload-slot"

type Props = {
  form: UseFormReturnType<FormModel>
  isLoading: boolean
}

export function LogosSection({ form, isLoading }: Props) {
  const t = useTranslations("systemSettings")

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur">
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <ImageIcon className="text-muted-foreground size-4" />
          {t("logos.title")}
        </CardTitle>
        <CardDescription className="text-xs">
          {t("logos.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 pt-0">
        <div className="grid gap-3 sm:grid-cols-2">
          <LogoUploadSlot
            key={form.key("logoForLightBgUrl")}
            label={t("logos.forLightBg")}
            hint={t("logos.forLightBgHint")}
            value={form.values.logoForLightBgUrl}
            onChange={(url) => form.setFieldValue("logoForLightBgUrl", url)}
            error={
              form.errors.logoForLightBgUrl
                ? String(form.errors.logoForLightBgUrl)
                : undefined
            }
            previewClassName="bg-background"
            removeLabel={t("logos.remove")}
            disabled={isLoading}
          />
          <LogoUploadSlot
            key={form.key("logoForDarkBgUrl")}
            label={t("logos.forDarkBg")}
            hint={t("logos.forDarkBgHint")}
            value={form.values.logoForDarkBgUrl}
            onChange={(url) => form.setFieldValue("logoForDarkBgUrl", url)}
            error={
              form.errors.logoForDarkBgUrl
                ? String(form.errors.logoForDarkBgUrl)
                : undefined
            }
            previewClassName="bg-zinc-900"
            removeLabel={t("logos.remove")}
            disabled={isLoading}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <LogoUploadSlot
            key={form.key("logoSquareUrl")}
            label={t("logos.squareLogo")}
            hint={t("logos.squareLogoHint")}
            value={form.values.logoSquareUrl}
            onChange={(url) => form.setFieldValue("logoSquareUrl", url)}
            error={
              form.errors.logoSquareUrl
                ? String(form.errors.logoSquareUrl)
                : undefined
            }
            previewClassName="bg-muted"
            removeLabel={t("logos.remove")}
            disabled={isLoading}
          />
          <LogoUploadSlot
            key={form.key("faviconUrl")}
            label={t("logos.favicon")}
            hint={t("logos.faviconHint")}
            value={form.values.faviconUrl}
            onChange={(url) => form.setFieldValue("faviconUrl", url)}
            error={
              form.errors.faviconUrl
                ? String(form.errors.faviconUrl)
                : undefined
            }
            previewClassName="bg-background"
            removeLabel={t("logos.remove")}
            disabled={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  )
}
