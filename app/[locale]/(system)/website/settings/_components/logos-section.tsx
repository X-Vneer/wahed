"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
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
  const t = useTranslations("websiteCms.settings")

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
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field data-invalid={!!form.errors.siteNameAr}>
            <FieldLabel htmlFor="ws-site-name-ar">
              {t("logos.siteNameAr")}
            </FieldLabel>
            <FieldDescription>{t("logos.siteNameHint")}</FieldDescription>
            <FieldContent>
              <Input
                id="ws-site-name-ar"
                key={form.key("siteNameAr")}
                {...form.getInputProps("siteNameAr")}
                disabled={isLoading}
                dir="rtl"
                aria-invalid={!!form.errors.siteNameAr}
              />
              {form.errors.siteNameAr ? (
                <FieldError>{String(form.errors.siteNameAr)}</FieldError>
              ) : null}
            </FieldContent>
          </Field>
          <Field data-invalid={!!form.errors.siteNameEn}>
            <FieldLabel htmlFor="ws-site-name-en">
              {t("logos.siteNameEn")}
            </FieldLabel>
            <FieldDescription>{t("logos.siteNameHint")}</FieldDescription>
            <FieldContent>
              <Input
                id="ws-site-name-en"
                key={form.key("siteNameEn")}
                {...form.getInputProps("siteNameEn")}
                disabled={isLoading}
                aria-invalid={!!form.errors.siteNameEn}
              />
              {form.errors.siteNameEn ? (
                <FieldError>{String(form.errors.siteNameEn)}</FieldError>
              ) : null}
            </FieldContent>
          </Field>
        </div>
      </CardContent>
    </Card>
  )
}
