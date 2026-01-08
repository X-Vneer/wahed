"use client"

import { Field, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { useProjectFormContext } from "./project-form-context"
import { useTranslations } from "next-intl"

export function InternallyRegisteredField() {
  const t = useTranslations()
  const form = useProjectFormContext()

  return (
    <Field orientation="horizontal" className="items-center">
      <Switch
        id="isActive"
        checked={form.values.isActive}
        onCheckedChange={(checked) =>
          form.setFieldValue("isActive", checked === true)
        }
      />
      <FieldLabel htmlFor="isActive" className="flex-1 cursor-pointer">
        {t("projects.form.internallyRegistered")}
      </FieldLabel>
    </Field>
  )
}
