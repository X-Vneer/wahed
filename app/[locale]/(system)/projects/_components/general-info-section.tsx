"use client"

import {
  Field,
  FieldError,
  FieldLabel,
  FieldLegend,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useProjectFormContext } from "./project-form-context"
import { useTranslations } from "next-intl"

export function GeneralInfoSection() {
  const t = useTranslations()
  const form = useProjectFormContext()

  return (
    <>
      <FieldLegend>{t("projects.form.generalInfo")}</FieldLegend>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Project Name in Arabic */}
        <Field data-invalid={!!form.errors.nameAr}>
          <FieldLabel htmlFor="nameAr">{t("projects.form.nameAr")}</FieldLabel>
          <Input
            id="nameAr"
            key={form.key("nameAr")}
            {...form.getInputProps("nameAr")}
            placeholder={t("projects.form.nameArPlaceholder")}
            aria-invalid={!!form.errors.nameAr}
          />
          {form.errors.nameAr && (
            <FieldError errors={[{ message: String(form.errors.nameAr) }]} />
          )}
        </Field>

        {/* Project Name in English */}
        <Field data-invalid={!!form.errors.nameEn}>
          <FieldLabel htmlFor="nameEn">{t("projects.form.nameEn")}</FieldLabel>
          <Input
            id="nameEn"
            key={form.key("nameEn")}
            {...form.getInputProps("nameEn")}
            placeholder={t("projects.form.nameEnPlaceholder")}
            aria-invalid={!!form.errors.nameEn}
          />
          {form.errors.nameEn && (
            <FieldError errors={[{ message: String(form.errors.nameEn) }]} />
          )}
        </Field>
      </div>

      {/* Project Description in Arabic */}
      <Field data-invalid={!!form.errors.descriptionAr}>
        <FieldLabel htmlFor="descriptionAr">
          {t("projects.form.descriptionAr")}
        </FieldLabel>
        <Textarea
          id="descriptionAr"
          key={form.key("descriptionAr")}
          {...form.getInputProps("descriptionAr")}
          placeholder={t("projects.form.descriptionArPlaceholder")}
          aria-invalid={!!form.errors.descriptionAr}
          className="min-h-24"
        />
        {form.errors.descriptionAr && (
          <FieldError
            errors={[{ message: String(form.errors.descriptionAr) }]}
          />
        )}
      </Field>

      {/* Project Description in English */}
      <Field data-invalid={!!form.errors.descriptionEn}>
        <FieldLabel htmlFor="descriptionEn">
          {t("projects.form.descriptionEn")}
        </FieldLabel>
        <Textarea
          id="descriptionEn"
          key={form.key("descriptionEn")}
          {...form.getInputProps("descriptionEn")}
          placeholder={t("projects.form.descriptionEnPlaceholder")}
          aria-invalid={!!form.errors.descriptionEn}
          className="min-h-24"
        />
        {form.errors.descriptionEn && (
          <FieldError
            errors={[{ message: String(form.errors.descriptionEn) }]}
          />
        )}
      </Field>
    </>
  )
}
