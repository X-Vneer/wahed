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

export type ContactSectionValues = {
  eyebrowTitleAr: string
  eyebrowTitleEn: string
  titleAr: string
  titleEn: string
  contentAr: string
  contentEn: string
  ctaLabelAr: string
  ctaLabelEn: string
}

type ContactSectionFormProps = {
  slug: string
  onSubmit?: (payload: {
    slug: string
    values: ContactSectionValues
  }) => Promise<void> | void
  initialValues?: ContactSectionValues
}

export function ContactSectionForm({
  slug,
  onSubmit,
  initialValues,
}: ContactSectionFormProps) {
  const t = useTranslations("websiteCms")
  const safeInitialValues: ContactSectionValues = {
    eyebrowTitleAr: initialValues?.eyebrowTitleAr ?? "",
    eyebrowTitleEn: initialValues?.eyebrowTitleEn ?? "",
    titleAr: initialValues?.titleAr ?? "",
    titleEn: initialValues?.titleEn ?? "",
    contentAr: initialValues?.contentAr ?? "",
    contentEn: initialValues?.contentEn ?? "",
    ctaLabelAr: initialValues?.ctaLabelAr ?? "",
    ctaLabelEn: initialValues?.ctaLabelEn ?? "",
  }

  const form = useForm<ContactSectionValues>({
    mode: "controlled",
    initialValues: safeInitialValues,
  })

  useEffect(() => {
    form.setValues(safeInitialValues)
  }, [initialValues]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (values: ContactSectionValues) => {
    form.clearFieldError("root")

    try {
      if (!onSubmit) return
      await onSubmit({ slug, values })
      toast.success(t(`${slug}.contactSection.success.saved` as never))
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const rootError = handleFormErrors(error, form)
        const message =
          rootError || t(`${slug}.contactSection.errors.saveFailed` as never)
        form.setFieldError("root", message)
        toast.error(message)
        return
      }

      const message =
        (error as Error)?.message ||
        t(`${slug}.contactSection.errors.saveFailed` as never)
      form.setFieldError("root", message)
      toast.error(message)
    }
  }

  return (
    <Card className="border-border/70 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle>{t(`${slug}.contactSection.title` as never)}</CardTitle>
        <CardDescription>
          {t(`${slug}.contactSection.description` as never)}
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
                <FieldLabel htmlFor="contact-eyebrow-title-ar">
                  {t(`${slug}.contactSection.fields.eyebrowTitleAr` as never)}
                </FieldLabel>
                <Input
                  id="contact-eyebrow-title-ar"
                  placeholder={t(
                    `${slug}.contactSection.placeholders.eyebrowTitleAr` as never
                  )}
                  {...form.getInputProps("eyebrowTitleAr")}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="contact-eyebrow-title-en">
                  {t(`${slug}.contactSection.fields.eyebrowTitleEn` as never)}
                </FieldLabel>
                <Input
                  id="contact-eyebrow-title-en"
                  placeholder={t(
                    `${slug}.contactSection.placeholders.eyebrowTitleEn` as never
                  )}
                  {...form.getInputProps("eyebrowTitleEn")}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="contact-title-ar">
                  {t(`${slug}.contactSection.fields.titleAr` as never)}
                </FieldLabel>
                <Input
                  id="contact-title-ar"
                  placeholder={t(
                    `${slug}.contactSection.placeholders.titleAr` as never
                  )}
                  {...form.getInputProps("titleAr")}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="contact-title-en">
                  {t(`${slug}.contactSection.fields.titleEn` as never)}
                </FieldLabel>
                <Input
                  id="contact-title-en"
                  placeholder={t(
                    `${slug}.contactSection.placeholders.titleEn` as never
                  )}
                  {...form.getInputProps("titleEn")}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="contact-content-ar">
                  {t(`${slug}.contactSection.fields.contentAr` as never)}
                </FieldLabel>
                <Textarea
                  id="contact-content-ar"
                  className="min-h-28"
                  placeholder={t(
                    `${slug}.contactSection.placeholders.contentAr` as never
                  )}
                  {...form.getInputProps("contentAr")}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="contact-content-en">
                  {t(`${slug}.contactSection.fields.contentEn` as never)}
                </FieldLabel>
                <Textarea
                  id="contact-content-en"
                  className="min-h-28"
                  placeholder={t(
                    `${slug}.contactSection.placeholders.contentEn` as never
                  )}
                  {...form.getInputProps("contentEn")}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="contact-label-ar">
                  {t(`${slug}.contactSection.fields.ctaLabelAr` as never)}
                </FieldLabel>
                <Input
                  id="contact-label-ar"
                  placeholder={t(
                    `${slug}.contactSection.placeholders.ctaLabelAr` as never
                  )}
                  {...form.getInputProps("ctaLabelAr")}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="contact-label-en">
                  {t(`${slug}.contactSection.fields.ctaLabelEn` as never)}
                </FieldLabel>
                <Input
                  id="contact-label-en"
                  placeholder={t(
                    `${slug}.contactSection.placeholders.ctaLabelEn` as never
                  )}
                  {...form.getInputProps("ctaLabelEn")}
                />
              </Field>
            </div>

            <Field>
              <FieldDescription>
                {t(`${slug}.contactSection.ui.bilingualHint` as never)}
              </FieldDescription>
            </Field>
          </FieldGroup>

          {form.errors.root && (
            <FieldError errors={[{ message: String(form.errors.root) }]} />
          )}

          <Button type="submit" disabled={form.submitting}>
            {form.submitting && <Spinner data-icon="inline-start" />}
            {t(`${slug}.contactSection.save` as never)}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
