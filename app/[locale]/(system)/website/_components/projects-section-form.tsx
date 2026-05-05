"use client"

import { useForm } from "@mantine/form"
import axios from "axios"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { toast } from "sonner"

import { handleFormErrors } from "@/utils/handle-form-errors"
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
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

export type ProjectsSectionValues = {
  isActive: boolean
  eyebrowTitleAr: string
  eyebrowTitleEn: string
  titleAr: string
  titleEn: string
  contentAr: string
  contentEn: string
}

type ProjectsSectionFormProps = {
  slug: string
  onSubmit?: (payload: {
    slug: string
    values: ProjectsSectionValues
  }) => Promise<void> | void
  initialValues?: ProjectsSectionValues
}

const EMPTY_VALUES: ProjectsSectionValues = {
  isActive: true,
  eyebrowTitleAr: "",
  eyebrowTitleEn: "",
  titleAr: "",
  titleEn: "",
  contentAr: "",
  contentEn: "",
}

export function ProjectsSectionForm({
  slug,
  onSubmit,
  initialValues,
}: ProjectsSectionFormProps) {
  const t = useTranslations("websiteCms")

  const safeInitialValues: ProjectsSectionValues = {
    ...EMPTY_VALUES,
    ...initialValues,
  }

  const form = useForm<ProjectsSectionValues>({
    mode: "controlled",
    initialValues: safeInitialValues,
  })

  useEffect(() => {
    form.setValues(safeInitialValues)
  }, [JSON.stringify(initialValues)]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (values: ProjectsSectionValues) => {
    form.clearFieldError("root")

    try {
      if (!onSubmit) return
      await onSubmit({ slug, values })
      toast.success(t(`${slug}.projectsSection.success.saved` as never))
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const rootError = handleFormErrors(error, form)
        const message =
          rootError || t(`${slug}.projectsSection.errors.saveFailed` as never)
        form.setFieldError("root", message)
        toast.error(message)
        return
      }

      const message =
        (error as Error)?.message ||
        t(`${slug}.projectsSection.errors.saveFailed` as never)
      form.setFieldError("root", message)
      toast.error(message)
    }
  }

  return (
    <Card className="border-border/70 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle>{t(`${slug}.projectsSection.title` as never)}</CardTitle>
        <CardDescription>
          {t(`${slug}.projectsSection.description` as never)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.onSubmit(handleSubmit)}
          className="flex flex-col gap-6"
        >
          <FieldGroup className="flex flex-col gap-6">
            <Field orientation="horizontal" className="items-center gap-3">
              <Switch
                id="projects-section-is-active"
                checked={form.values.isActive}
                onCheckedChange={(checked) =>
                  form.setFieldValue("isActive", checked)
                }
              />
              <div className="flex flex-col gap-0.5">
                <FieldLabel
                  htmlFor="projects-section-is-active"
                  className="cursor-pointer"
                >
                  {t(`${slug}.projectsSection.fields.isActive` as never)}
                </FieldLabel>
                <FieldDescription>
                  {t(`${slug}.projectsSection.ui.isActiveHint` as never)}
                </FieldDescription>
              </div>
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="projects-section-eyebrow-title-ar">
                  {t(`${slug}.projectsSection.fields.eyebrowTitleAr` as never)}
                </FieldLabel>
                <Input
                  id="projects-section-eyebrow-title-ar"
                  placeholder={t(
                    `${slug}.projectsSection.placeholders.eyebrowTitleAr` as never
                  )}
                  {...form.getInputProps("eyebrowTitleAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="projects-section-eyebrow-title-en">
                  {t(`${slug}.projectsSection.fields.eyebrowTitleEn` as never)}
                </FieldLabel>
                <Input
                  id="projects-section-eyebrow-title-en"
                  placeholder={t(
                    `${slug}.projectsSection.placeholders.eyebrowTitleEn` as never
                  )}
                  {...form.getInputProps("eyebrowTitleEn")}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="projects-section-title-ar">
                  {t(`${slug}.projectsSection.fields.titleAr` as never)}
                </FieldLabel>
                <Input
                  id="projects-section-title-ar"
                  placeholder={t(
                    `${slug}.projectsSection.placeholders.titleAr` as never
                  )}
                  {...form.getInputProps("titleAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="projects-section-title-en">
                  {t(`${slug}.projectsSection.fields.titleEn` as never)}
                </FieldLabel>
                <Input
                  id="projects-section-title-en"
                  placeholder={t(
                    `${slug}.projectsSection.placeholders.titleEn` as never
                  )}
                  {...form.getInputProps("titleEn")}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="projects-section-content-ar">
                  {t(`${slug}.projectsSection.fields.contentAr` as never)}
                </FieldLabel>
                <Textarea
                  id="projects-section-content-ar"
                  className="min-h-28"
                  placeholder={t(
                    `${slug}.projectsSection.placeholders.contentAr` as never
                  )}
                  {...form.getInputProps("contentAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="projects-section-content-en">
                  {t(`${slug}.projectsSection.fields.contentEn` as never)}
                </FieldLabel>
                <Textarea
                  id="projects-section-content-en"
                  className="min-h-28"
                  placeholder={t(
                    `${slug}.projectsSection.placeholders.contentEn` as never
                  )}
                  {...form.getInputProps("contentEn")}
                />
              </Field>
            </div>

            <Field>
              <FieldDescription>
                {t(`${slug}.projectsSection.ui.bilingualHint` as never)}
              </FieldDescription>
            </Field>
          </FieldGroup>
          {form.errors.root && (
            <FieldError errors={[{ message: String(form.errors.root) }]} />
          )}
          <Button type="submit" disabled={form.submitting}>
            {form.submitting && <Spinner data-icon="inline-start" />}
            {t(`${slug}.projectsSection.save` as never)}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
