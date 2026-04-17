/* eslint-disable @next/next/no-img-element */
"use client"

import { useForm } from "@mantine/form"
import axios from "axios"
import { X } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import Uploader from "@/components/uploader"
import { handleFormErrors } from "@/lib/handle-form-errors"

export type ContactFormSectionValues = {
  sectionTitleAr: string
  sectionTitleEn: string
  sectionSubtitleAr: string
  sectionSubtitleEn: string
  avatarImage: string
  submitLabelAr: string
  submitLabelEn: string
  orTextAr: string
  orTextEn: string
  whatsappLabelAr: string
  whatsappLabelEn: string
  whatsappNumber: string
}

type ContactFormSectionFormProps = {
  slug: string
  onSubmit?: (payload: {
    slug: string
    values: ContactFormSectionValues
  }) => Promise<void> | void
  initialValues?: ContactFormSectionValues
}

const emptyValues: ContactFormSectionValues = {
  sectionTitleAr: "",
  sectionTitleEn: "",
  sectionSubtitleAr: "",
  sectionSubtitleEn: "",
  avatarImage: "",
  submitLabelAr: "",
  submitLabelEn: "",
  orTextAr: "",
  orTextEn: "",
  whatsappLabelAr: "",
  whatsappLabelEn: "",
  whatsappNumber: "",
}

export function ContactFormSectionForm({
  slug,
  onSubmit,
  initialValues,
}: ContactFormSectionFormProps) {
  const t = useTranslations("websiteCms")
  const safeInitialValues: ContactFormSectionValues = {
    ...emptyValues,
    ...initialValues,
  }

  const form = useForm<ContactFormSectionValues>({
    mode: "controlled",
    initialValues: safeInitialValues,
  })

  useEffect(() => {
    form.setValues({ ...emptyValues, ...initialValues })
  }, [JSON.stringify(initialValues)]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (values: ContactFormSectionValues) => {
    form.clearFieldError("root")

    try {
      if (!onSubmit) return
      await onSubmit({ slug, values })
      toast.success(t(`${slug}.formSection.success.saved` as never))
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const rootError = handleFormErrors(error, form)
        const message =
          rootError || t(`${slug}.formSection.errors.saveFailed` as never)
        form.setFieldError("root", message)
        toast.error(message)
        return
      }

      const message =
        (error as Error)?.message ||
        t(`${slug}.formSection.errors.saveFailed` as never)
      form.setFieldError("root", message)
      toast.error(message)
    }
  }

  return (
    <Card className="border-border/70 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle>{t(`${slug}.formSection.title` as never)}</CardTitle>
        <CardDescription>
          {t(`${slug}.formSection.description` as never)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.onSubmit(handleSubmit)}
          className="flex flex-col gap-6"
        >
          <FieldGroup className="flex flex-col gap-6">
            <p className="text-muted-foreground text-sm font-medium">
              {t(`${slug}.formSection.groups.header` as never)}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="contact-form-section-title-ar">
                  {t(`${slug}.formSection.fields.sectionTitleAr` as never)}
                </FieldLabel>
                <Input
                  id="contact-form-section-title-ar"
                  placeholder={t(
                    `${slug}.formSection.placeholders.sectionTitleAr` as never
                  )}
                  {...form.getInputProps("sectionTitleAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="contact-form-section-title-en">
                  {t(`${slug}.formSection.fields.sectionTitleEn` as never)}
                </FieldLabel>
                <Input
                  id="contact-form-section-title-en"
                  placeholder={t(
                    `${slug}.formSection.placeholders.sectionTitleEn` as never
                  )}
                  {...form.getInputProps("sectionTitleEn")}
                />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="contact-form-section-subtitle-ar">
                  {t(`${slug}.formSection.fields.sectionSubtitleAr` as never)}
                </FieldLabel>
                <Input
                  id="contact-form-section-subtitle-ar"
                  placeholder={t(
                    `${slug}.formSection.placeholders.sectionSubtitleAr` as never
                  )}
                  {...form.getInputProps("sectionSubtitleAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="contact-form-section-subtitle-en">
                  {t(`${slug}.formSection.fields.sectionSubtitleEn` as never)}
                </FieldLabel>
                <Input
                  id="contact-form-section-subtitle-en"
                  placeholder={t(
                    `${slug}.formSection.placeholders.sectionSubtitleEn` as never
                  )}
                  {...form.getInputProps("sectionSubtitleEn")}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel>
                {t(`${slug}.formSection.fields.avatarImage` as never)}
              </FieldLabel>
              <FieldDescription>
                {t(`${slug}.formSection.ui.avatarHint` as never)}
              </FieldDescription>
              <div className="bg-muted/40 mt-2 rounded-xl border border-dashed p-4">
                <Uploader
                  endpoint="websiteImageUploader"
                  onClientUploadComplete={(res) => {
                    if (res && res.length > 0) {
                      form.setFieldValue("avatarImage", res[0].ufsUrl)
                    }
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(error.message || "Upload failed")
                  }}
                />
              </div>
              {form.values.avatarImage ? (
                <div className="bg-muted/20 relative mt-2 h-32 w-32 overflow-hidden rounded-full border">
                  <img
                    src={form.values.avatarImage}
                    alt={t(`${slug}.formSection.fields.avatarImage` as never)}
                    className="h-full w-full object-cover"
                  />
                  <Button
                    size="icon"
                    className="absolute top-1 right-1 h-7 w-7"
                    variant="destructive"
                    type="button"
                    onClick={() => form.setFieldValue("avatarImage", "")}
                    aria-label={t(
                      `${slug}.formSection.ui.removeAvatar` as never
                    )}
                  >
                    <X />
                  </Button>
                </div>
              ) : null}
            </Field>

            <p className="text-muted-foreground text-sm font-medium">
              {t(`${slug}.formSection.groups.actions` as never)}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="contact-form-submit-ar">
                  {t(`${slug}.formSection.fields.submitLabelAr` as never)}
                </FieldLabel>
                <Input
                  id="contact-form-submit-ar"
                  placeholder={t(
                    `${slug}.formSection.placeholders.submitLabelAr` as never
                  )}
                  {...form.getInputProps("submitLabelAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="contact-form-submit-en">
                  {t(`${slug}.formSection.fields.submitLabelEn` as never)}
                </FieldLabel>
                <Input
                  id="contact-form-submit-en"
                  placeholder={t(
                    `${slug}.formSection.placeholders.submitLabelEn` as never
                  )}
                  {...form.getInputProps("submitLabelEn")}
                />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="contact-form-or-text-ar">
                  {t(`${slug}.formSection.fields.orTextAr` as never)}
                </FieldLabel>
                <Input
                  id="contact-form-or-text-ar"
                  placeholder={t(
                    `${slug}.formSection.placeholders.orTextAr` as never
                  )}
                  {...form.getInputProps("orTextAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="contact-form-or-text-en">
                  {t(`${slug}.formSection.fields.orTextEn` as never)}
                </FieldLabel>
                <Input
                  id="contact-form-or-text-en"
                  placeholder={t(
                    `${slug}.formSection.placeholders.orTextEn` as never
                  )}
                  {...form.getInputProps("orTextEn")}
                />
              </Field>
            </div>

            <p className="text-muted-foreground text-sm font-medium">
              {t(`${slug}.formSection.groups.whatsapp` as never)}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="contact-form-whatsapp-label-ar">
                  {t(`${slug}.formSection.fields.whatsappLabelAr` as never)}
                </FieldLabel>
                <Input
                  id="contact-form-whatsapp-label-ar"
                  placeholder={t(
                    `${slug}.formSection.placeholders.whatsappLabelAr` as never
                  )}
                  {...form.getInputProps("whatsappLabelAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="contact-form-whatsapp-label-en">
                  {t(`${slug}.formSection.fields.whatsappLabelEn` as never)}
                </FieldLabel>
                <Input
                  id="contact-form-whatsapp-label-en"
                  placeholder={t(
                    `${slug}.formSection.placeholders.whatsappLabelEn` as never
                  )}
                  {...form.getInputProps("whatsappLabelEn")}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="contact-form-whatsapp-number">
                {t(`${slug}.formSection.fields.whatsappNumber` as never)}
              </FieldLabel>
              <Input
                id="contact-form-whatsapp-number"
                placeholder={t(
                  `${slug}.formSection.placeholders.whatsappNumber` as never
                )}
                {...form.getInputProps("whatsappNumber")}
              />
            </Field>
            <Field>
              <FieldDescription>
                {t(`${slug}.formSection.ui.bilingualHint` as never)}
              </FieldDescription>
            </Field>
          </FieldGroup>

          {form.errors.root && (
            <FieldError errors={[{ message: String(form.errors.root) }]} />
          )}

          <Button type="submit" disabled={form.submitting}>
            {form.submitting && <Spinner data-icon="inline-start" />}
            {t(`${slug}.formSection.save` as never)}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
