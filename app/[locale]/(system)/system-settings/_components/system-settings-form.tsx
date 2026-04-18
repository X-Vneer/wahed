"use client"

import { Button } from "@/components/ui/button"
import { Field, FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { handleFormErrors } from "@/lib/handle-form-errors"
import {
  type SystemSiteSettingsFormValues,
  systemSiteSettingsFormSchema,
} from "@/lib/schemas/system-site-settings"
import type { SystemSiteSettingsAdminDto } from "@/lib/system-site-settings/service"
import { useForm } from "@mantine/form"
import axios from "axios"
import { zod4Resolver } from "mantine-form-zod-resolver"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import {
  type FormModel,
  emptyValues,
  valuesFromSettings,
} from "./form-model"
import { IdentitySection } from "./identity-section"
import { LoginSection } from "./login-section"
import { LogosSection } from "./logos-section"
import { SupportSection } from "./support-section"
import { ThemeSection } from "./theme-section"

type Props = {
  settings: SystemSiteSettingsAdminDto | null
  isLoading: boolean
  onSave: (values: SystemSiteSettingsFormValues) => Promise<void>
}

export function SystemSettingsForm({ settings, isLoading, onSave }: Props) {
  const t = useTranslations("systemSettings")

  const form = useForm<FormModel>({
    mode: "controlled",
    initialValues: settings ? valuesFromSettings(settings) : emptyValues,
    validate: zod4Resolver(systemSiteSettingsFormSchema),
  })

  const handleSubmit = async (values: SystemSiteSettingsFormValues) => {
    form.clearFieldError("root")
    try {
      await onSave({
        ...values,
        supportEmail: values.supportEmail.trim(),
        supportPhone: values.supportPhone.trim(),
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
      <IdentitySection form={form} isLoading={isLoading} />
      <LogosSection form={form} isLoading={isLoading} />
      <ThemeSection form={form} isLoading={isLoading} />
      <LoginSection form={form} isLoading={isLoading} />
      <SupportSection form={form} isLoading={isLoading} />

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
