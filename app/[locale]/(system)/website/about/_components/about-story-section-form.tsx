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
import { Textarea } from "@/components/ui/textarea"

export type AboutStorySectionValues = {
  eyebrowTitleAr: string
  eyebrowTitleEn: string
  titleAr: string
  titleEn: string
  contentAr: string
  contentEn: string
}

type AboutStorySectionFormProps = {
  slug: string
  onSubmit?: (payload: {
    slug: string
    values: AboutStorySectionValues
  }) => Promise<void> | void
  initialValues?: AboutStorySectionValues
}

export function AboutStorySectionForm({
  slug,
  onSubmit,
  initialValues,
}: AboutStorySectionFormProps) {
  const t = useTranslations("websiteCms")
  const safeInitialValues: AboutStorySectionValues = {
    eyebrowTitleAr: initialValues?.eyebrowTitleAr ?? "",
    eyebrowTitleEn: initialValues?.eyebrowTitleEn ?? "",
    titleAr: initialValues?.titleAr ?? "",
    titleEn: initialValues?.titleEn ?? "",
    contentAr: initialValues?.contentAr ?? "",
    contentEn: initialValues?.contentEn ?? "",
  }

  const form = useForm<AboutStorySectionValues>({
    mode: "controlled",
    initialValues: safeInitialValues,
  })

  useEffect(() => {
    form.setValues(safeInitialValues)
  }, [JSON.stringify(initialValues)]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (values: AboutStorySectionValues) => {
    form.clearFieldError("root")

    try {
      if (!onSubmit) return
      await onSubmit({ slug, values })
      toast.success(t(`${slug}.storySection.success.saved` as never))
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const rootError = handleFormErrors(error, form)
        const message =
          rootError || t(`${slug}.storySection.errors.saveFailed` as never)
        form.setFieldError("root", message)
        toast.error(message)
        return
      }

      const message =
        (error as Error)?.message ||
        t(`${slug}.storySection.errors.saveFailed` as never)
      form.setFieldError("root", message)
      toast.error(message)
    }
  }

  return (
    <Card className="border-border/70 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle>{t(`${slug}.storySection.title` as never)}</CardTitle>
        <CardDescription>
          {t(`${slug}.storySection.description` as never)}
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
                <FieldLabel htmlFor="about-story-eyebrow-ar">
                  {t(`${slug}.storySection.fields.eyebrowTitleAr` as never)}
                </FieldLabel>
                <Input
                  id="about-story-eyebrow-ar"
                  placeholder={t(
                    `${slug}.storySection.placeholders.eyebrowTitleAr` as never
                  )}
                  {...form.getInputProps("eyebrowTitleAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="about-story-eyebrow-en">
                  {t(`${slug}.storySection.fields.eyebrowTitleEn` as never)}
                </FieldLabel>
                <Input
                  id="about-story-eyebrow-en"
                  placeholder={t(
                    `${slug}.storySection.placeholders.eyebrowTitleEn` as never
                  )}
                  {...form.getInputProps("eyebrowTitleEn")}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="about-story-title-ar">
                  {t(`${slug}.storySection.fields.titleAr` as never)}
                </FieldLabel>
                <Input
                  id="about-story-title-ar"
                  placeholder={t(
                    `${slug}.storySection.placeholders.titleAr` as never
                  )}
                  {...form.getInputProps("titleAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="about-story-title-en">
                  {t(`${slug}.storySection.fields.titleEn` as never)}
                </FieldLabel>
                <Input
                  id="about-story-title-en"
                  placeholder={t(
                    `${slug}.storySection.placeholders.titleEn` as never
                  )}
                  {...form.getInputProps("titleEn")}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="about-story-content-ar">
                  {t(`${slug}.storySection.fields.contentAr` as never)}
                </FieldLabel>
                <Textarea
                  id="about-story-content-ar"
                  className="min-h-32"
                  placeholder={t(
                    `${slug}.storySection.placeholders.contentAr` as never
                  )}
                  {...form.getInputProps("contentAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="about-story-content-en">
                  {t(`${slug}.storySection.fields.contentEn` as never)}
                </FieldLabel>
                <Textarea
                  id="about-story-content-en"
                  className="min-h-32"
                  placeholder={t(
                    `${slug}.storySection.placeholders.contentEn` as never
                  )}
                  {...form.getInputProps("contentEn")}
                />
              </Field>
            </div>

            <Field>
              <FieldDescription>
                {t(`${slug}.storySection.ui.bilingualHint` as never)}
              </FieldDescription>
            </Field>
          </FieldGroup>
          {form.errors.root && (
            <FieldError errors={[{ message: String(form.errors.root) }]} />
          )}
          <Button type="submit" disabled={form.submitting}>
            {form.submitting && <Spinner data-icon="inline-start" />}
            {t(`${slug}.storySection.save` as never)}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
