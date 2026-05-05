"use client"

import { Button } from "@/components/ui/button"
import { Field, FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { handleFormErrors } from "@/utils/handle-form-errors"
import {
  type WebsiteSiteSettingsFormValues,
  websiteSiteSettingsFormSchema,
} from "@/schemas/website-site-settings"
import type { WebsiteSiteSettingsAdminDto } from "@/lib/website-site-settings/service"
import { useForm } from "@mantine/form"
import axios from "axios"
import { zod4Resolver } from "mantine-form-zod-resolver"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { AnalyticsSection } from "./analytics-section"
import { FooterSection } from "./footer-section"
import { type FormModel, emptyValues, valuesFromSettings } from "./form-model"
import { LogosSection } from "./logos-section"
import { SeoSection } from "./seo-section"
import { SocialMediaSection } from "./social-media-section"
import { ThemeSection } from "./theme-section"

type Props = {
  settings: WebsiteSiteSettingsAdminDto | null
  isLoading: boolean
  onSave: (values: WebsiteSiteSettingsFormValues) => Promise<void>
}

export function WebsiteSettingsForm({ settings, isLoading, onSave }: Props) {
  const t = useTranslations("websiteCms.settings")

  const form = useForm<FormModel>({
    mode: "controlled",
    initialValues: settings ? valuesFromSettings(settings) : emptyValues,
    validate: zod4Resolver(websiteSiteSettingsFormSchema),
  })

  const handleSubmit = async (values: WebsiteSiteSettingsFormValues) => {
    form.clearFieldError("root")
    try {
      await onSave({
        ...values,
        publicContactEmail: values.publicContactEmail.trim(),
        publicPhone: values.publicPhone.trim(),
        googleAnalyticsMeasurementId:
          values.googleAnalyticsMeasurementId.trim(),
      })
      toast.success(t("toast.saved"))
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = handleFormErrors(error, form) ?? t("toast.saveFailed")
        toast.error(message)
        return
      }
      toast.error(t("toast.saveFailed"))
    }
  }

  return (
    <form
      onSubmit={form.onSubmit(handleSubmit)}
      className="flex flex-col gap-4"
    >
      <ThemeSection form={form} isLoading={isLoading} />
      <LogosSection form={form} isLoading={isLoading} />
      <SeoSection form={form} isLoading={isLoading} />
      <AnalyticsSection form={form} isLoading={isLoading} />
      <SocialMediaSection form={form} isLoading={isLoading} />
      <FooterSection form={form} isLoading={isLoading} />

      {form.errors.root ? (
        <Field data-invalid>
          <FieldError>{String(form.errors.root)}</FieldError>
        </Field>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="w-full sm:w-auto"
        disabled={isLoading || form.submitting}
      >
        {form.submitting ? <Spinner className="size-4" /> : t("saveAll")}
      </Button>
    </form>
  )
}
