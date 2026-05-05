/* eslint-disable @next/next/no-img-element */
"use client"

import { useForm } from "@mantine/form"
import axios from "axios"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"
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
import Uploader from "@/components/uploader"
import { handleFormErrors } from "@/utils/handle-form-errors"

export type HeroSectionValues = {
  backgroundImage: string
  titleAr: string
  titleEn: string
  descriptionAr: string
  descriptionEn: string
  ctaLabelAr: string
  ctaLabelEn: string
}

type HeroSectionFormProps = {
  slug: string
  onSubmit?: (payload: {
    slug: string
    values: HeroSectionValues
  }) => Promise<void> | void
  initialValues?: HeroSectionValues
}

export function HeroSectionForm({
  slug,
  onSubmit,
  initialValues,
}: HeroSectionFormProps) {
  const t = useTranslations("websiteCms")

  const form = useForm<HeroSectionValues>({
    mode: "controlled",
    initialValues: {
      backgroundImage: initialValues?.backgroundImage ?? "",
      titleAr: initialValues?.titleAr ?? "",
      titleEn: initialValues?.titleEn ?? "",
      descriptionAr: initialValues?.descriptionAr ?? "",
      descriptionEn: initialValues?.descriptionEn ?? "",
      ctaLabelAr: initialValues?.ctaLabelAr ?? "",
      ctaLabelEn: initialValues?.ctaLabelEn ?? "",
    },
  })

  const handleSubmit = async (values: HeroSectionValues) => {
    form.clearFieldError("root")

    try {
      if (!onSubmit) return
      await onSubmit({ slug, values })
      toast.success(t(`${slug}.heroSection.success.saved` as never))
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const rootError = handleFormErrors(error, form)
        const message =
          rootError || t(`${slug}.heroSection.errors.saveFailed` as never)
        form.setFieldError("root", message)
        toast.error(message)
        return
      }

      const message =
        (error as Error)?.message ||
        t(`${slug}.heroSection.errors.saveFailed` as never)
      form.setFieldError("root", message)
      toast.error(message)
    }
  }

  return (
    <Card className="border-border/70 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle>{t(`${slug}.heroSection.title` as never)}</CardTitle>
        <CardDescription>
          {t(`${slug}.heroSection.description` as never)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.onSubmit(handleSubmit)}
          className="flex flex-col gap-6"
        >
          <FieldGroup className="flex flex-col gap-6">
            <Field>
              <FieldLabel>
                {t(`${slug}.heroSection.fields.backgroundImage` as never)}
              </FieldLabel>
              <FieldDescription>
                {t(`${slug}.heroSection.ui.backgroundImageHint` as never)}
              </FieldDescription>
              {!form.values.backgroundImage ? (
                <div className="bg-muted/40 mt-2 rounded-xl border border-dashed p-4">
                  <Uploader
                    endpoint="websiteImageUploader"
                    onClientUploadComplete={(res) => {
                      if (res && res.length > 0) {
                        form.setFieldValue("backgroundImage", res[0].ufsUrl)
                      }
                    }}
                    onUploadError={(error: Error) => {
                      toast.error(error.message || "Upload failed")
                    }}
                  />
                </div>
              ) : (
                <div className="bg-muted/20 mt-2 flex flex-col gap-3 rounded-xl border p-3">
                  <div className="bg-background relative h-[300px] w-full overflow-hidden rounded-lg border">
                    <img
                      src={form.values.backgroundImage}
                      alt={t(
                        `${slug}.heroSection.fields.backgroundImage` as never
                      )}
                      className="h-full w-full object-cover"
                    />
                    <Button
                      size="icon"
                      className="absolute top-2 right-2"
                      variant="destructive"
                      type="button"
                      onClick={() => form.setFieldValue("backgroundImage", "")}
                      aria-label={t(
                        `${slug}.heroSection.ui.removeImage` as never
                      )}
                    >
                      <X />
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {t(`${slug}.heroSection.ui.imageUploaded` as never)}
                  </p>
                </div>
              )}
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="hero-title-ar">
                  {t(`${slug}.heroSection.fields.titleAr` as never)}
                </FieldLabel>
                <Input
                  id="hero-title-ar"
                  placeholder={t(
                    `${slug}.heroSection.placeholders.titleAr` as never
                  )}
                  {...form.getInputProps("titleAr")}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="hero-title-en">
                  {t(`${slug}.heroSection.fields.titleEn` as never)}
                </FieldLabel>
                <Input
                  id="hero-title-en"
                  placeholder={t(
                    `${slug}.heroSection.placeholders.titleEn` as never
                  )}
                  {...form.getInputProps("titleEn")}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="hero-description-ar">
                  {t(`${slug}.heroSection.fields.descriptionAr` as never)}
                </FieldLabel>
                <Textarea
                  id="hero-description-ar"
                  className="min-h-28"
                  placeholder={t(
                    `${slug}.heroSection.placeholders.descriptionAr` as never
                  )}
                  {...form.getInputProps("descriptionAr")}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="hero-description-en">
                  {t(`${slug}.heroSection.fields.descriptionEn` as never)}
                </FieldLabel>
                <Textarea
                  id="hero-description-en"
                  className="min-h-28"
                  placeholder={t(
                    `${slug}.heroSection.placeholders.descriptionEn` as never
                  )}
                  {...form.getInputProps("descriptionEn")}
                />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="hero-cta-label-ar">
                  {t(`${slug}.heroSection.fields.ctaLabelAr` as never)}
                </FieldLabel>
                <Input
                  id="hero-cta-label-ar"
                  placeholder={t(
                    `${slug}.heroSection.placeholders.ctaLabelAr` as never
                  )}
                  {...form.getInputProps("ctaLabelAr")}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="hero-cta-label-en">
                  {t(`${slug}.heroSection.fields.ctaLabelEn` as never)}
                </FieldLabel>
                <Input
                  id="hero-cta-label-en"
                  placeholder={t(
                    `${slug}.heroSection.placeholders.ctaLabelEn` as never
                  )}
                  {...form.getInputProps("ctaLabelEn")}
                />
              </Field>
            </div>

            <Field>
              <FieldDescription>
                {t(`${slug}.heroSection.ui.bilingualHint` as never)}
              </FieldDescription>
            </Field>
          </FieldGroup>
          {form.errors.root && (
            <FieldError errors={[{ message: String(form.errors.root) }]} />
          )}
          <Button type="submit" disabled={form.submitting}>
            {form.submitting && <Spinner data-icon="inline-start" />}
            {t(`${slug}.heroSection.save` as never)}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
