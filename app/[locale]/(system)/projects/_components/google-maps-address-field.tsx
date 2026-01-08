"use client"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useProjectFormContext } from "./project-form-context"
import { useTranslations } from "next-intl"

export function GoogleMapsAddressField() {
  const t = useTranslations()
  const form = useProjectFormContext()

  return (
    <Field data-invalid={!!form.errors.googleMapsAddress}>
      <FieldLabel htmlFor="googleMapsAddress">
        {t("projects.form.googleMapsAddress")}
      </FieldLabel>
      <Input
        type="url"
        id="googleMapsAddress"
        key={form.key("googleMapsAddress")}
        {...form.getInputProps("googleMapsAddress")}
        placeholder={t("projects.form.googleMapsAddressPlaceholder")}
        aria-invalid={!!form.errors.googleMapsAddress}
      />
      {form.errors.googleMapsAddress && (
        <FieldError
          errors={[{ message: String(form.errors.googleMapsAddress) }]}
        />
      )}
    </Field>
  )
}
