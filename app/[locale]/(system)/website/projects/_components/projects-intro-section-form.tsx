"use client"

import { useForm } from "@mantine/form"
import axios from "axios"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { handleFormErrors } from "@/utils/handle-form-errors"

export type ProjectsIntroSectionValues = {
  contentAr: string
  contentEn: string
}

type Props = {
  onSubmit?: (payload: {
    values: ProjectsIntroSectionValues
  }) => Promise<void> | void
  initialValues?: ProjectsIntroSectionValues
}

export function ProjectsIntroSectionForm({ onSubmit, initialValues }: Props) {
  const t = useTranslations("websiteCms.projects")

  const safeInitialValues: ProjectsIntroSectionValues = {
    contentAr: initialValues?.contentAr ?? "",
    contentEn: initialValues?.contentEn ?? "",
  }

  const form = useForm<ProjectsIntroSectionValues>({
    mode: "controlled",
    initialValues: safeInitialValues,
  })

  useEffect(() => {
    form.setValues(safeInitialValues)
  }, [JSON.stringify(initialValues)]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (values: ProjectsIntroSectionValues) => {
    form.clearFieldError("root")
    try {
      if (!onSubmit) return
      await onSubmit({ values })
      toast.success(t("introSection.success.saved"))
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const rootError = handleFormErrors(error, form)
        const message = rootError || t("introSection.errors.saveFailed")
        form.setFieldError("root", message)
        toast.error(message)
        return
      }
      const message =
        (error as Error)?.message || t("introSection.errors.saveFailed")
      form.setFieldError("root", message)
      toast.error(message)
    }
  }

  return (
    <Card className="border-border/70 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle>{t("introSection.title")}</CardTitle>
        <CardDescription>{t("introSection.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.onSubmit(handleSubmit)}
          className="flex flex-col gap-6"
        >
          <FieldGroup className="flex flex-col gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="projects-intro-content-ar">
                  {t("introSection.fields.contentAr")}
                </FieldLabel>
                <Textarea
                  id="projects-intro-content-ar"
                  placeholder={t("introSection.placeholders.contentAr")}
                  dir="rtl"
                  rows={4}
                  {...form.getInputProps("contentAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="projects-intro-content-en">
                  {t("introSection.fields.contentEn")}
                </FieldLabel>
                <Textarea
                  id="projects-intro-content-en"
                  placeholder={t("introSection.placeholders.contentEn")}
                  rows={4}
                  {...form.getInputProps("contentEn")}
                />
              </Field>
            </div>

            <Field>
              <FieldDescription>
                {t("introSection.ui.bilingualHint")}
              </FieldDescription>
            </Field>
          </FieldGroup>

          {form.errors.root && (
            <FieldError errors={[{ message: String(form.errors.root) }]} />
          )}

          <Button type="submit" disabled={form.submitting}>
            {form.submitting && <Spinner data-icon="inline-start" />}
            {t("introSection.save")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
