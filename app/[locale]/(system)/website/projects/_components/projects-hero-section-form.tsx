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

export type ProjectsHeroSectionValues = {
  backgroundImage: string
  eyebrowTitleAr: string
  eyebrowTitleEn: string
  titleAr: string
  titleEn: string
}

type Props = {
  onSubmit?: (payload: {
    values: ProjectsHeroSectionValues
  }) => Promise<void> | void
  initialValues?: ProjectsHeroSectionValues
}

export function ProjectsHeroSectionForm({ onSubmit, initialValues }: Props) {
  const t = useTranslations("websiteCms.projects")

  const safeInitialValues: ProjectsHeroSectionValues = {
    backgroundImage: initialValues?.backgroundImage ?? "",
    eyebrowTitleAr: initialValues?.eyebrowTitleAr ?? "",
    eyebrowTitleEn: initialValues?.eyebrowTitleEn ?? "",
    titleAr: initialValues?.titleAr ?? "",
    titleEn: initialValues?.titleEn ?? "",
  }

  const form = useForm<ProjectsHeroSectionValues>({
    mode: "controlled",
    initialValues: safeInitialValues,
  })

  useEffect(() => {
    form.setValues(safeInitialValues)
  }, [JSON.stringify(initialValues)]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (values: ProjectsHeroSectionValues) => {
    form.clearFieldError("root")
    try {
      if (!onSubmit) return
      await onSubmit({ values })
      toast.success(t("heroSection.success.saved"))
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const rootError = handleFormErrors(error, form)
        const message = rootError || t("heroSection.errors.saveFailed")
        form.setFieldError("root", message)
        toast.error(message)
        return
      }
      const message =
        (error as Error)?.message || t("heroSection.errors.saveFailed")
      form.setFieldError("root", message)
      toast.error(message)
    }
  }

  return (
    <Card className="border-border/70 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle>{t("heroSection.title")}</CardTitle>
        <CardDescription>{t("heroSection.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.onSubmit(handleSubmit)}
          className="flex flex-col gap-6"
        >
          <FieldGroup className="flex flex-col gap-6">
            <Field>
              <FieldLabel>
                {t("heroSection.fields.backgroundImage")}
              </FieldLabel>
              <FieldDescription>
                {t("heroSection.ui.backgroundImageHint")}
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
                  <div className="bg-background relative h-[240px] w-full overflow-hidden rounded-lg border">
                    <img
                      src={form.values.backgroundImage}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <Button
                      size="icon"
                      className="absolute top-2 right-2"
                      variant="destructive"
                      type="button"
                      onClick={() => form.setFieldValue("backgroundImage", "")}
                      aria-label={t("heroSection.ui.removeImage")}
                    >
                      <X />
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {t("heroSection.ui.imageUploaded")}
                  </p>
                </div>
              )}
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="projects-hero-eyebrow-ar">
                  {t("heroSection.fields.eyebrowTitleAr")}
                </FieldLabel>
                <Input
                  id="projects-hero-eyebrow-ar"
                  placeholder={t("heroSection.placeholders.eyebrowTitleAr")}
                  dir="rtl"
                  {...form.getInputProps("eyebrowTitleAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="projects-hero-eyebrow-en">
                  {t("heroSection.fields.eyebrowTitleEn")}
                </FieldLabel>
                <Input
                  id="projects-hero-eyebrow-en"
                  placeholder={t("heroSection.placeholders.eyebrowTitleEn")}
                  {...form.getInputProps("eyebrowTitleEn")}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="projects-hero-title-ar">
                  {t("heroSection.fields.titleAr")}
                </FieldLabel>
                <Input
                  id="projects-hero-title-ar"
                  placeholder={t("heroSection.placeholders.titleAr")}
                  dir="rtl"
                  {...form.getInputProps("titleAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="projects-hero-title-en">
                  {t("heroSection.fields.titleEn")}
                </FieldLabel>
                <Input
                  id="projects-hero-title-en"
                  placeholder={t("heroSection.placeholders.titleEn")}
                  {...form.getInputProps("titleEn")}
                />
              </Field>
            </div>

            <Field>
              <FieldDescription>
                {t("heroSection.ui.bilingualHint")}
              </FieldDescription>
            </Field>
          </FieldGroup>

          {form.errors.root && (
            <FieldError errors={[{ message: String(form.errors.root) }]} />
          )}

          <Button type="submit" disabled={form.submitting}>
            {form.submitting && <Spinner data-icon="inline-start" />}
            {t("heroSection.save")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
