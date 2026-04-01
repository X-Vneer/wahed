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
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { handleFormErrors } from "@/lib/handle-form-errors"

export type ContactHeroInfoSectionValues = {
  eyebrowTitleAr: string
  eyebrowTitleEn: string
  heroTitleAr: string
  heroTitleEn: string
  infoTitleAr: string
  infoTitleEn: string
  infoContentAr: string
  infoContentEn: string
  channelsTitleAr: string
  channelsTitleEn: string
  phone: string
  email: string
  linkedin: string
  instagram: string
}

type ContactHeroInfoSectionFormProps = {
  slug: string
  onSubmit?: (payload: {
    slug: string
    values: ContactHeroInfoSectionValues
  }) => Promise<void> | void
  initialValues?: ContactHeroInfoSectionValues
}

const emptyValues: ContactHeroInfoSectionValues = {
  eyebrowTitleAr: "",
  eyebrowTitleEn: "",
  heroTitleAr: "",
  heroTitleEn: "",
  infoTitleAr: "",
  infoTitleEn: "",
  infoContentAr: "",
  infoContentEn: "",
  channelsTitleAr: "",
  channelsTitleEn: "",
  phone: "",
  email: "",
  linkedin: "",
  instagram: "",
}

export function ContactHeroInfoSectionForm({
  slug,
  onSubmit,
  initialValues,
}: ContactHeroInfoSectionFormProps) {
  const t = useTranslations("websiteCms")
  const safeInitialValues: ContactHeroInfoSectionValues = {
    ...emptyValues,
    ...initialValues,
  }

  const form = useForm<ContactHeroInfoSectionValues>({
    mode: "controlled",
    initialValues: safeInitialValues,
  })

  useEffect(() => {
    form.setValues({ ...emptyValues, ...initialValues })
  }, [initialValues]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (values: ContactHeroInfoSectionValues) => {
    form.clearFieldError("root")

    try {
      if (!onSubmit) return
      await onSubmit({ slug, values })
      toast.success(t(`${slug}.heroInfoSection.success.saved` as never))
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const rootError = handleFormErrors(error, form)
        const message =
          rootError ||
          t(`${slug}.heroInfoSection.errors.saveFailed` as never)
        form.setFieldError("root", message)
        toast.error(message)
        return
      }

      const message =
        (error as Error)?.message ||
        t(`${slug}.heroInfoSection.errors.saveFailed` as never)
      form.setFieldError("root", message)
      toast.error(message)
    }
  }

  return (
    <Card className="border-border/70 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle>{t(`${slug}.heroInfoSection.title` as never)}</CardTitle>
        <CardDescription>
          {t(`${slug}.heroInfoSection.description` as never)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.onSubmit(handleSubmit)}
          className="flex flex-col gap-6"
        >
          <FieldGroup className="flex flex-col gap-6">
            <p className="text-muted-foreground text-sm font-medium">
              {t(`${slug}.heroInfoSection.groups.hero` as never)}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="contact-hi-eyebrow-ar">
                  {t(
                    `${slug}.heroInfoSection.fields.eyebrowTitleAr` as never
                  )}
                </FieldLabel>
                <Input
                  id="contact-hi-eyebrow-ar"
                  placeholder={t(
                    `${slug}.heroInfoSection.placeholders.eyebrowTitleAr` as never
                  )}
                  {...form.getInputProps("eyebrowTitleAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="contact-hi-eyebrow-en">
                  {t(
                    `${slug}.heroInfoSection.fields.eyebrowTitleEn` as never
                  )}
                </FieldLabel>
                <Input
                  id="contact-hi-eyebrow-en"
                  placeholder={t(
                    `${slug}.heroInfoSection.placeholders.eyebrowTitleEn` as never
                  )}
                  {...form.getInputProps("eyebrowTitleEn")}
                />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="contact-hi-hero-title-ar">
                  {t(`${slug}.heroInfoSection.fields.heroTitleAr` as never)}
                </FieldLabel>
                <Input
                  id="contact-hi-hero-title-ar"
                  placeholder={t(
                    `${slug}.heroInfoSection.placeholders.heroTitleAr` as never
                  )}
                  {...form.getInputProps("heroTitleAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="contact-hi-hero-title-en">
                  {t(`${slug}.heroInfoSection.fields.heroTitleEn` as never)}
                </FieldLabel>
                <Input
                  id="contact-hi-hero-title-en"
                  placeholder={t(
                    `${slug}.heroInfoSection.placeholders.heroTitleEn` as never
                  )}
                  {...form.getInputProps("heroTitleEn")}
                />
              </Field>
            </div>

            <p className="text-muted-foreground text-sm font-medium">
              {t(`${slug}.heroInfoSection.groups.sidebar` as never)}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="contact-hi-info-title-ar">
                  {t(`${slug}.heroInfoSection.fields.infoTitleAr` as never)}
                </FieldLabel>
                <Input
                  id="contact-hi-info-title-ar"
                  placeholder={t(
                    `${slug}.heroInfoSection.placeholders.infoTitleAr` as never
                  )}
                  {...form.getInputProps("infoTitleAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="contact-hi-info-title-en">
                  {t(`${slug}.heroInfoSection.fields.infoTitleEn` as never)}
                </FieldLabel>
                <Input
                  id="contact-hi-info-title-en"
                  placeholder={t(
                    `${slug}.heroInfoSection.placeholders.infoTitleEn` as never
                  )}
                  {...form.getInputProps("infoTitleEn")}
                />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="contact-hi-info-content-ar">
                  {t(`${slug}.heroInfoSection.fields.infoContentAr` as never)}
                </FieldLabel>
                <Textarea
                  id="contact-hi-info-content-ar"
                  className="min-h-28"
                  placeholder={t(
                    `${slug}.heroInfoSection.placeholders.infoContentAr` as never
                  )}
                  {...form.getInputProps("infoContentAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="contact-hi-info-content-en">
                  {t(`${slug}.heroInfoSection.fields.infoContentEn` as never)}
                </FieldLabel>
                <Textarea
                  id="contact-hi-info-content-en"
                  className="min-h-28"
                  placeholder={t(
                    `${slug}.heroInfoSection.placeholders.infoContentEn` as never
                  )}
                  {...form.getInputProps("infoContentEn")}
                />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="contact-hi-channels-ar">
                  {t(
                    `${slug}.heroInfoSection.fields.channelsTitleAr` as never
                  )}
                </FieldLabel>
                <Input
                  id="contact-hi-channels-ar"
                  placeholder={t(
                    `${slug}.heroInfoSection.placeholders.channelsTitleAr` as never
                  )}
                  {...form.getInputProps("channelsTitleAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="contact-hi-channels-en">
                  {t(
                    `${slug}.heroInfoSection.fields.channelsTitleEn` as never
                  )}
                </FieldLabel>
                <Input
                  id="contact-hi-channels-en"
                  placeholder={t(
                    `${slug}.heroInfoSection.placeholders.channelsTitleEn` as never
                  )}
                  {...form.getInputProps("channelsTitleEn")}
                />
              </Field>
            </div>

            <p className="text-muted-foreground text-sm font-medium">
              {t(`${slug}.heroInfoSection.groups.channels` as never)}
            </p>
            <Field>
              <FieldDescription>
                {t(`${slug}.heroInfoSection.ui.sharedContactHint` as never)}
              </FieldDescription>
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="contact-hi-phone">
                  {t(`${slug}.heroInfoSection.fields.phone` as never)}
                </FieldLabel>
                <Input
                  id="contact-hi-phone"
                  placeholder={t(
                    `${slug}.heroInfoSection.placeholders.phone` as never
                  )}
                  {...form.getInputProps("phone")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="contact-hi-email">
                  {t(`${slug}.heroInfoSection.fields.email` as never)}
                </FieldLabel>
                <Input
                  id="contact-hi-email"
                  type="email"
                  placeholder={t(
                    `${slug}.heroInfoSection.placeholders.email` as never
                  )}
                  {...form.getInputProps("email")}
                />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="contact-hi-linkedin">
                  {t(`${slug}.heroInfoSection.fields.linkedin` as never)}
                </FieldLabel>
                <Input
                  id="contact-hi-linkedin"
                  placeholder={t(
                    `${slug}.heroInfoSection.placeholders.linkedin` as never
                  )}
                  {...form.getInputProps("linkedin")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="contact-hi-instagram">
                  {t(`${slug}.heroInfoSection.fields.instagram` as never)}
                </FieldLabel>
                <Input
                  id="contact-hi-instagram"
                  placeholder={t(
                    `${slug}.heroInfoSection.placeholders.instagram` as never
                  )}
                  {...form.getInputProps("instagram")}
                />
              </Field>
            </div>

            <Field>
              <FieldDescription>
                {t(`${slug}.heroInfoSection.ui.bilingualHint` as never)}
              </FieldDescription>
            </Field>
          </FieldGroup>

          {form.errors.root && (
            <FieldError errors={[{ message: String(form.errors.root) }]} />
          )}

          <Button type="submit" disabled={form.submitting}>
            {form.submitting && <Spinner data-icon="inline-start" />}
            {t(`${slug}.heroInfoSection.save` as never)}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
