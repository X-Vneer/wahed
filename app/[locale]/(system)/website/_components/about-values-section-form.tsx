"use client"

import { useForm } from "@mantine/form"
import axios from "axios"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { toast } from "sonner"

import { handleFormErrors } from "@/lib/handle-form-errors"
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
import { Textarea } from "@/components/ui/textarea"

export type AboutValuesSectionValues = {
  eyebrowTitleAr: string
  eyebrowTitleEn: string
  titleAr: string
  titleEn: string
  firstTitleAr: string
  firstTitleEn: string
  firstContentAr: string
  firstContentEn: string
  secondTitleAr: string
  secondTitleEn: string
  secondContentAr: string
  secondContentEn: string
  thirdTitleAr: string
  thirdTitleEn: string
  thirdContentAr: string
  thirdContentEn: string
}

type AboutValuesSectionFormProps = {
  slug: string
  onSubmit?: (payload: {
    slug: string
    values: AboutValuesSectionValues
  }) => Promise<void> | void
  initialValues?: AboutValuesSectionValues
}

export function AboutValuesSectionForm({
  slug,
  onSubmit,
  initialValues,
}: AboutValuesSectionFormProps) {
  const t = useTranslations("websiteCms")
  const safeInitialValues: AboutValuesSectionValues = {
    eyebrowTitleAr: initialValues?.eyebrowTitleAr ?? "",
    eyebrowTitleEn: initialValues?.eyebrowTitleEn ?? "",
    titleAr: initialValues?.titleAr ?? "",
    titleEn: initialValues?.titleEn ?? "",
    firstTitleAr: initialValues?.firstTitleAr ?? "",
    firstTitleEn: initialValues?.firstTitleEn ?? "",
    firstContentAr: initialValues?.firstContentAr ?? "",
    firstContentEn: initialValues?.firstContentEn ?? "",
    secondTitleAr: initialValues?.secondTitleAr ?? "",
    secondTitleEn: initialValues?.secondTitleEn ?? "",
    secondContentAr: initialValues?.secondContentAr ?? "",
    secondContentEn: initialValues?.secondContentEn ?? "",
    thirdTitleAr: initialValues?.thirdTitleAr ?? "",
    thirdTitleEn: initialValues?.thirdTitleEn ?? "",
    thirdContentAr: initialValues?.thirdContentAr ?? "",
    thirdContentEn: initialValues?.thirdContentEn ?? "",
  }

  const form = useForm<AboutValuesSectionValues>({
    mode: "controlled",
    initialValues: safeInitialValues,
  })

  useEffect(() => {
    form.setValues(safeInitialValues)
  }, [initialValues]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (values: AboutValuesSectionValues) => {
    form.clearFieldError("root")

    try {
      if (!onSubmit) return
      await onSubmit({ slug, values })
      toast.success(t(`${slug}.valuesSection.success.saved` as never))
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const rootError = handleFormErrors(error, form)
        const message =
          rootError || t(`${slug}.valuesSection.errors.saveFailed` as never)
        form.setFieldError("root", message)
        toast.error(message)
        return
      }

      const message =
        (error as Error)?.message ||
        t(`${slug}.valuesSection.errors.saveFailed` as never)
      form.setFieldError("root", message)
      toast.error(message)
    }
  }

  return (
    <Card className="border-border/70 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle>{t(`${slug}.valuesSection.title` as never)}</CardTitle>
        <CardDescription>
          {t(`${slug}.valuesSection.description` as never)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.onSubmit(handleSubmit)}
          className="flex flex-col gap-6"
        >
          <FieldGroup className="flex flex-col gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="about-values-eyebrow-ar">
                  {t(`${slug}.valuesSection.fields.eyebrowTitleAr` as never)}
                </FieldLabel>
                <Input
                  id="about-values-eyebrow-ar"
                  placeholder={t(
                    `${slug}.valuesSection.placeholders.eyebrowTitleAr` as never
                  )}
                  {...form.getInputProps("eyebrowTitleAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="about-values-eyebrow-en">
                  {t(`${slug}.valuesSection.fields.eyebrowTitleEn` as never)}
                </FieldLabel>
                <Input
                  id="about-values-eyebrow-en"
                  placeholder={t(
                    `${slug}.valuesSection.placeholders.eyebrowTitleEn` as never
                  )}
                  {...form.getInputProps("eyebrowTitleEn")}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="about-values-title-ar">
                  {t(`${slug}.valuesSection.fields.titleAr` as never)}
                </FieldLabel>
                <Input
                  id="about-values-title-ar"
                  placeholder={t(`${slug}.valuesSection.placeholders.titleAr` as never)}
                  {...form.getInputProps("titleAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="about-values-title-en">
                  {t(`${slug}.valuesSection.fields.titleEn` as never)}
                </FieldLabel>
                <Input
                  id="about-values-title-en"
                  placeholder={t(`${slug}.valuesSection.placeholders.titleEn` as never)}
                  {...form.getInputProps("titleEn")}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="about-values-first-title-ar">
                  {t(`${slug}.valuesSection.fields.firstTitleAr` as never)}
                </FieldLabel>
                <Input
                  id="about-values-first-title-ar"
                  placeholder={t(
                    `${slug}.valuesSection.placeholders.firstTitleAr` as never
                  )}
                  {...form.getInputProps("firstTitleAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="about-values-first-title-en">
                  {t(`${slug}.valuesSection.fields.firstTitleEn` as never)}
                </FieldLabel>
                <Input
                  id="about-values-first-title-en"
                  placeholder={t(
                    `${slug}.valuesSection.placeholders.firstTitleEn` as never
                  )}
                  {...form.getInputProps("firstTitleEn")}
                />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="about-values-first-content-ar">
                  {t(`${slug}.valuesSection.fields.firstContentAr` as never)}
                </FieldLabel>
                <Textarea
                  id="about-values-first-content-ar"
                  className="min-h-24"
                  placeholder={t(
                    `${slug}.valuesSection.placeholders.firstContentAr` as never
                  )}
                  {...form.getInputProps("firstContentAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="about-values-first-content-en">
                  {t(`${slug}.valuesSection.fields.firstContentEn` as never)}
                </FieldLabel>
                <Textarea
                  id="about-values-first-content-en"
                  className="min-h-24"
                  placeholder={t(
                    `${slug}.valuesSection.placeholders.firstContentEn` as never
                  )}
                  {...form.getInputProps("firstContentEn")}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="about-values-second-title-ar">
                  {t(`${slug}.valuesSection.fields.secondTitleAr` as never)}
                </FieldLabel>
                <Input
                  id="about-values-second-title-ar"
                  placeholder={t(
                    `${slug}.valuesSection.placeholders.secondTitleAr` as never
                  )}
                  {...form.getInputProps("secondTitleAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="about-values-second-title-en">
                  {t(`${slug}.valuesSection.fields.secondTitleEn` as never)}
                </FieldLabel>
                <Input
                  id="about-values-second-title-en"
                  placeholder={t(
                    `${slug}.valuesSection.placeholders.secondTitleEn` as never
                  )}
                  {...form.getInputProps("secondTitleEn")}
                />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="about-values-second-content-ar">
                  {t(`${slug}.valuesSection.fields.secondContentAr` as never)}
                </FieldLabel>
                <Textarea
                  id="about-values-second-content-ar"
                  className="min-h-24"
                  placeholder={t(
                    `${slug}.valuesSection.placeholders.secondContentAr` as never
                  )}
                  {...form.getInputProps("secondContentAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="about-values-second-content-en">
                  {t(`${slug}.valuesSection.fields.secondContentEn` as never)}
                </FieldLabel>
                <Textarea
                  id="about-values-second-content-en"
                  className="min-h-24"
                  placeholder={t(
                    `${slug}.valuesSection.placeholders.secondContentEn` as never
                  )}
                  {...form.getInputProps("secondContentEn")}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="about-values-third-title-ar">
                  {t(`${slug}.valuesSection.fields.thirdTitleAr` as never)}
                </FieldLabel>
                <Input
                  id="about-values-third-title-ar"
                  placeholder={t(
                    `${slug}.valuesSection.placeholders.thirdTitleAr` as never
                  )}
                  {...form.getInputProps("thirdTitleAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="about-values-third-title-en">
                  {t(`${slug}.valuesSection.fields.thirdTitleEn` as never)}
                </FieldLabel>
                <Input
                  id="about-values-third-title-en"
                  placeholder={t(
                    `${slug}.valuesSection.placeholders.thirdTitleEn` as never
                  )}
                  {...form.getInputProps("thirdTitleEn")}
                />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="about-values-third-content-ar">
                  {t(`${slug}.valuesSection.fields.thirdContentAr` as never)}
                </FieldLabel>
                <Textarea
                  id="about-values-third-content-ar"
                  className="min-h-24"
                  placeholder={t(
                    `${slug}.valuesSection.placeholders.thirdContentAr` as never
                  )}
                  {...form.getInputProps("thirdContentAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="about-values-third-content-en">
                  {t(`${slug}.valuesSection.fields.thirdContentEn` as never)}
                </FieldLabel>
                <Textarea
                  id="about-values-third-content-en"
                  className="min-h-24"
                  placeholder={t(
                    `${slug}.valuesSection.placeholders.thirdContentEn` as never
                  )}
                  {...form.getInputProps("thirdContentEn")}
                />
              </Field>
            </div>

            <Field>
              <FieldDescription>
                {t(`${slug}.valuesSection.ui.bilingualHint` as never)}
              </FieldDescription>
            </Field>
          </FieldGroup>
          {form.errors.root && (
            <FieldError errors={[{ message: String(form.errors.root) }]} />
          )}
          <Button type="submit" disabled={form.submitting}>
            {form.submitting && <Spinner data-icon="inline-start" />}
            {t(`${slug}.valuesSection.save` as never)}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
