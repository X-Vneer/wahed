/* eslint-disable @next/next/no-img-element */
"use client"

import { useForm } from "@mantine/form"
import axios from "axios"
import { X } from "lucide-react"
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
import Uploader from "@/components/uploader"

export type AboutVisionMissionSectionValues = {
  image: string
  visionTitleAr: string
  visionTitleEn: string
  visionContentAr: string
  visionContentEn: string
  missionTitleAr: string
  missionTitleEn: string
  missionContentAr: string
  missionContentEn: string
}

type AboutVisionMissionSectionFormProps = {
  slug: string
  onSubmit?: (payload: {
    slug: string
    values: AboutVisionMissionSectionValues
  }) => Promise<void> | void
  initialValues?: AboutVisionMissionSectionValues
}

export function AboutVisionMissionSectionForm({
  slug,
  onSubmit,
  initialValues,
}: AboutVisionMissionSectionFormProps) {
  const t = useTranslations("websiteCms")
  const safeInitialValues: AboutVisionMissionSectionValues = {
    image: initialValues?.image ?? "",
    visionTitleAr: initialValues?.visionTitleAr ?? "",
    visionTitleEn: initialValues?.visionTitleEn ?? "",
    visionContentAr: initialValues?.visionContentAr ?? "",
    visionContentEn: initialValues?.visionContentEn ?? "",
    missionTitleAr: initialValues?.missionTitleAr ?? "",
    missionTitleEn: initialValues?.missionTitleEn ?? "",
    missionContentAr: initialValues?.missionContentAr ?? "",
    missionContentEn: initialValues?.missionContentEn ?? "",
  }

  const form = useForm<AboutVisionMissionSectionValues>({
    mode: "controlled",
    initialValues: safeInitialValues,
  })

  useEffect(() => {
    form.setValues(safeInitialValues)
  }, [JSON.stringify(initialValues)]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (values: AboutVisionMissionSectionValues) => {
    form.clearFieldError("root")

    try {
      if (!onSubmit) return
      await onSubmit({ slug, values })
      toast.success(t(`${slug}.visionMissionSection.success.saved` as never))
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const rootError = handleFormErrors(error, form)
        const message =
          rootError ||
          t(`${slug}.visionMissionSection.errors.saveFailed` as never)
        form.setFieldError("root", message)
        toast.error(message)
        return
      }

      const message =
        (error as Error)?.message ||
        t(`${slug}.visionMissionSection.errors.saveFailed` as never)
      form.setFieldError("root", message)
      toast.error(message)
    }
  }

  return (
    <Card className="border-border/70 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle>
          {t(`${slug}.visionMissionSection.title` as never)}
        </CardTitle>
        <CardDescription>
          {t(`${slug}.visionMissionSection.description` as never)}
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
                {t(`${slug}.visionMissionSection.fields.image` as never)}
              </FieldLabel>
              <FieldDescription>
                {t(`${slug}.visionMissionSection.ui.imageHint` as never)}
              </FieldDescription>
              {!form.values.image ? (
                <div className="bg-muted/40 mt-2 rounded-xl border border-dashed p-4">
                  <Uploader
                    endpoint="websiteImageUploader"
                    onClientUploadComplete={(res) => {
                      if (res && res.length > 0) {
                        form.setFieldValue("image", res[0].ufsUrl)
                      }
                    }}
                    onUploadError={(error: Error) => {
                      toast.error(error.message || "Upload failed")
                    }}
                  />
                </div>
              ) : (
                <div className="bg-muted/20 mt-2 flex flex-col gap-3 rounded-xl border p-3">
                  <div className="bg-background relative h-[220px] w-full overflow-hidden rounded-lg border">
                    <img
                      src={form.values.image}
                      alt={t(
                        `${slug}.visionMissionSection.fields.image` as never
                      )}
                      className="h-full w-full object-cover"
                    />
                    <Button
                      size="icon"
                      className="absolute top-2 right-2"
                      variant="destructive"
                      type="button"
                      onClick={() => form.setFieldValue("image", "")}
                      aria-label={t(
                        `${slug}.visionMissionSection.ui.removeImage` as never
                      )}
                    >
                      <X />
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {t(
                      `${slug}.visionMissionSection.ui.imageUploaded` as never
                    )}
                  </p>
                </div>
              )}
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="about-vision-title-ar">
                  {t(
                    `${slug}.visionMissionSection.fields.visionTitleAr` as never
                  )}
                </FieldLabel>
                <Input
                  id="about-vision-title-ar"
                  placeholder={t(
                    `${slug}.visionMissionSection.placeholders.visionTitleAr` as never
                  )}
                  {...form.getInputProps("visionTitleAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="about-vision-title-en">
                  {t(
                    `${slug}.visionMissionSection.fields.visionTitleEn` as never
                  )}
                </FieldLabel>
                <Input
                  id="about-vision-title-en"
                  placeholder={t(
                    `${slug}.visionMissionSection.placeholders.visionTitleEn` as never
                  )}
                  {...form.getInputProps("visionTitleEn")}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="about-vision-content-ar">
                  {t(
                    `${slug}.visionMissionSection.fields.visionContentAr` as never
                  )}
                </FieldLabel>
                <Textarea
                  id="about-vision-content-ar"
                  className="min-h-24"
                  placeholder={t(
                    `${slug}.visionMissionSection.placeholders.visionContentAr` as never
                  )}
                  {...form.getInputProps("visionContentAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="about-vision-content-en">
                  {t(
                    `${slug}.visionMissionSection.fields.visionContentEn` as never
                  )}
                </FieldLabel>
                <Textarea
                  id="about-vision-content-en"
                  className="min-h-24"
                  placeholder={t(
                    `${slug}.visionMissionSection.placeholders.visionContentEn` as never
                  )}
                  {...form.getInputProps("visionContentEn")}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="about-mission-title-ar">
                  {t(
                    `${slug}.visionMissionSection.fields.missionTitleAr` as never
                  )}
                </FieldLabel>
                <Input
                  id="about-mission-title-ar"
                  placeholder={t(
                    `${slug}.visionMissionSection.placeholders.missionTitleAr` as never
                  )}
                  {...form.getInputProps("missionTitleAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="about-mission-title-en">
                  {t(
                    `${slug}.visionMissionSection.fields.missionTitleEn` as never
                  )}
                </FieldLabel>
                <Input
                  id="about-mission-title-en"
                  placeholder={t(
                    `${slug}.visionMissionSection.placeholders.missionTitleEn` as never
                  )}
                  {...form.getInputProps("missionTitleEn")}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="about-mission-content-ar">
                  {t(
                    `${slug}.visionMissionSection.fields.missionContentAr` as never
                  )}
                </FieldLabel>
                <Textarea
                  id="about-mission-content-ar"
                  className="min-h-24"
                  placeholder={t(
                    `${slug}.visionMissionSection.placeholders.missionContentAr` as never
                  )}
                  {...form.getInputProps("missionContentAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="about-mission-content-en">
                  {t(
                    `${slug}.visionMissionSection.fields.missionContentEn` as never
                  )}
                </FieldLabel>
                <Textarea
                  id="about-mission-content-en"
                  className="min-h-24"
                  placeholder={t(
                    `${slug}.visionMissionSection.placeholders.missionContentEn` as never
                  )}
                  {...form.getInputProps("missionContentEn")}
                />
              </Field>
            </div>

            <Field>
              <FieldDescription>
                {t(`${slug}.visionMissionSection.ui.bilingualHint` as never)}
              </FieldDescription>
            </Field>
          </FieldGroup>
          {form.errors.root && (
            <FieldError errors={[{ message: String(form.errors.root) }]} />
          )}
          <Button type="submit" disabled={form.submitting}>
            {form.submitting && <Spinner data-icon="inline-start" />}
            {t(`${slug}.visionMissionSection.save` as never)}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
