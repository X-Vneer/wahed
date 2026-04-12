/* eslint-disable @next/next/no-img-element */
"use client"

import { useForm } from "@mantine/form"
import axios from "axios"
import { X } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import Uploader from "@/components/uploader"

export type PartnersSectionValues = {
  isActive: boolean
  logos: string[]
  eyebrowTitleAr: string
  eyebrowTitleEn: string
  titleAr: string
  titleEn: string
  contentAr: string
  contentEn: string
}

type PartnersSectionFormProps = {
  slug: string
  onSubmit?: (payload: {
    slug: string
    values: PartnersSectionValues
  }) => Promise<void> | void
  initialValues?: PartnersSectionValues
}

export function PartnersSectionForm({
  slug,
  onSubmit,
  initialValues,
}: PartnersSectionFormProps) {
  const t = useTranslations("websiteCms")
  const safeInitialValues: PartnersSectionValues = {
    isActive: initialValues?.isActive ?? false,
    logos: initialValues?.logos ?? [],
    eyebrowTitleAr: initialValues?.eyebrowTitleAr ?? "",
    eyebrowTitleEn: initialValues?.eyebrowTitleEn ?? "",
    titleAr: initialValues?.titleAr ?? "",
    titleEn: initialValues?.titleEn ?? "",
    contentAr: initialValues?.contentAr ?? "",
    contentEn: initialValues?.contentEn ?? "",
  }

  const form = useForm<PartnersSectionValues>({
    mode: "controlled",
    initialValues: safeInitialValues,
  })

  useEffect(() => {
    form.setValues(safeInitialValues)
  }, [JSON.stringify(initialValues)]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (values: PartnersSectionValues) => {
    form.clearFieldError("root")

    try {
      if (!onSubmit) return
      await onSubmit({ slug, values })
      toast.success(t(`${slug}.partnersSection.success.saved` as never))
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const rootError = handleFormErrors(error, form)
        const message =
          rootError || t(`${slug}.partnersSection.errors.saveFailed` as never)
        form.setFieldError("root", message)
        toast.error(message)
        return
      }

      const message =
        (error as Error)?.message ||
        t(`${slug}.partnersSection.errors.saveFailed` as never)
      form.setFieldError("root", message)
      toast.error(message)
    }
  }

  const removeLogoByIndex = (index: number) => {
    form.setFieldValue(
      "logos",
      form.values.logos.filter((_, logoIndex) => logoIndex !== index)
    )
  }

  return (
    <Card className="border-border/70 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle>{t(`${slug}.partnersSection.title` as never)}</CardTitle>
        <CardDescription>
          {t(`${slug}.partnersSection.description` as never)}
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
                id="partners-is-active"
                checked={form.values.isActive}
                onCheckedChange={(checked) =>
                  form.setFieldValue("isActive", checked)
                }
              />
              <div className="flex flex-col gap-0.5">
                <FieldLabel
                  htmlFor="partners-is-active"
                  className="cursor-pointer"
                >
                  {t(`${slug}.partnersSection.fields.isActive` as never)}
                </FieldLabel>
                <FieldDescription>
                  {t(`${slug}.partnersSection.ui.isActiveHint` as never)}
                </FieldDescription>
              </div>
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="partners-eyebrow-title-ar">
                  {t(`${slug}.partnersSection.fields.eyebrowTitleAr` as never)}
                </FieldLabel>
                <Input
                  id="partners-eyebrow-title-ar"
                  placeholder={t(
                    `${slug}.partnersSection.placeholders.eyebrowTitleAr` as never
                  )}
                  {...form.getInputProps("eyebrowTitleAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="partners-eyebrow-title-en">
                  {t(`${slug}.partnersSection.fields.eyebrowTitleEn` as never)}
                </FieldLabel>
                <Input
                  id="partners-eyebrow-title-en"
                  placeholder={t(
                    `${slug}.partnersSection.placeholders.eyebrowTitleEn` as never
                  )}
                  {...form.getInputProps("eyebrowTitleEn")}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="partners-title-ar">
                  {t(`${slug}.partnersSection.fields.titleAr` as never)}
                </FieldLabel>
                <Input
                  id="partners-title-ar"
                  placeholder={t(
                    `${slug}.partnersSection.placeholders.titleAr` as never
                  )}
                  {...form.getInputProps("titleAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="partners-title-en">
                  {t(`${slug}.partnersSection.fields.titleEn` as never)}
                </FieldLabel>
                <Input
                  id="partners-title-en"
                  placeholder={t(
                    `${slug}.partnersSection.placeholders.titleEn` as never
                  )}
                  {...form.getInputProps("titleEn")}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="partners-description-ar">
                  {t(`${slug}.partnersSection.fields.contentAr` as never)}
                </FieldLabel>
                <Textarea
                  id="partners-description-ar"
                  className="min-h-28"
                  placeholder={t(
                    `${slug}.partnersSection.placeholders.contentAr` as never
                  )}
                  {...form.getInputProps("contentAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="partners-description-en">
                  {t(`${slug}.partnersSection.fields.contentEn` as never)}
                </FieldLabel>
                <Textarea
                  id="partners-description-en"
                  className="min-h-28"
                  placeholder={t(
                    `${slug}.partnersSection.placeholders.contentEn` as never
                  )}
                  {...form.getInputProps("contentEn")}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel>
                {t(`${slug}.partnersSection.fields.logos` as never)}
              </FieldLabel>
              <FieldDescription>
                {t(`${slug}.partnersSection.ui.logosHint` as never)}
              </FieldDescription>
              <div className="bg-muted/40 mt-2 rounded-xl border border-dashed p-4">
                <Uploader
                  endpoint="websiteMultiImageUploader"
                  onClientUploadComplete={(res) => {
                    if (res && res.length > 0) {
                      const uploadedUrls = res.map((file) => file.ufsUrl)
                      const uniqueLogos = Array.from(
                        new Set([...form.values.logos, ...uploadedUrls])
                      )
                      form.setFieldValue("logos", uniqueLogos)
                    }
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(error.message || "Upload failed")
                  }}
                />
              </div>
            </Field>

            {form.values.logos.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {form.values.logos.map((logo, index) => (
                  <div
                    key={`${logo}-${index}`}
                    className="bg-muted/20 flex flex-col gap-2 rounded-xl border p-2"
                  >
                    <div className="bg-background relative h-28 overflow-hidden rounded-lg border p-2">
                      <img
                        src={logo}
                        alt={`${t(`${slug}.partnersSection.fields.logos` as never)} ${index + 1}`}
                        className="h-full w-full object-contain"
                      />
                      <Button
                        size="icon"
                        className="absolute top-1 right-1 h-7 w-7"
                        variant="destructive"
                        type="button"
                        onClick={() => removeLogoByIndex(index)}
                        aria-label={t(
                          `${slug}.partnersSection.ui.removeLogo` as never
                        )}
                      >
                        <X />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                {t(`${slug}.partnersSection.ui.noLogos` as never)}
              </p>
            )}

            <Field>
              <FieldDescription>
                {t(`${slug}.partnersSection.ui.bilingualHint` as never)}
              </FieldDescription>
            </Field>
          </FieldGroup>
          {form.errors.root && (
            <FieldError errors={[{ message: String(form.errors.root) }]} />
          )}
          <Button type="submit" disabled={form.submitting}>
            {form.submitting && <Spinner data-icon="inline-start" />}
            {t(`${slug}.partnersSection.save` as never)}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
