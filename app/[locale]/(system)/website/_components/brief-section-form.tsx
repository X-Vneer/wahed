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
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import Uploader from "@/components/uploader"

export type BriefSectionValues = {
  image: string
  contentAr: string
  contentEn: string
}

type BriefSectionFormProps = {
  slug: string
  onSubmit?: (payload: {
    slug: string
    values: BriefSectionValues
  }) => Promise<void> | void
  initialValues?: BriefSectionValues
}

export function BriefSectionForm({
  slug,
  onSubmit,
  initialValues,
}: BriefSectionFormProps) {
  const t = useTranslations("websiteCms")
  const safeInitialValues: BriefSectionValues = {
    image: initialValues?.image ?? "",
    contentAr: initialValues?.contentAr ?? "",
    contentEn: initialValues?.contentEn ?? "",
  }

  const form = useForm<BriefSectionValues>({
    mode: "controlled",
    initialValues: safeInitialValues,
  })

  useEffect(() => {
    form.setValues(safeInitialValues)
  }, [JSON.stringify(initialValues)]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (values: BriefSectionValues) => {
    form.clearFieldError("root")

    try {
      if (!onSubmit) return
      await onSubmit({ slug, values })
      toast.success(t(`${slug}.briefSection.success.saved` as never))
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const rootError = handleFormErrors(error, form)
        const message =
          rootError || t(`${slug}.briefSection.errors.saveFailed` as never)
        form.setFieldError("root", message)
        toast.error(message)
        return
      }

      const message =
        (error as Error)?.message ||
        t(`${slug}.briefSection.errors.saveFailed` as never)
      form.setFieldError("root", message)
      toast.error(message)
    }
  }

  return (
    <Card className="border-border/70 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle>{t(`${slug}.briefSection.title` as never)}</CardTitle>
        <CardDescription>
          {t(`${slug}.briefSection.description` as never)}
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
                {t(`${slug}.briefSection.fields.image` as never)}
              </FieldLabel>
              <FieldDescription>
                {t(`${slug}.briefSection.ui.imageHint` as never)}
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
                      alt={t(`${slug}.briefSection.fields.image` as never)}
                      className="h-full w-full object-contain"
                    />
                    <Button
                      size="icon"
                      className="absolute top-2 right-2"
                      variant="destructive"
                      type="button"
                      onClick={() => form.setFieldValue("image", "")}
                      aria-label={t(
                        `${slug}.briefSection.ui.removeImage` as never
                      )}
                    >
                      <X />
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {t(`${slug}.briefSection.ui.imageUploaded` as never)}
                  </p>
                </div>
              )}
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="brief-content-ar">
                  {t(`${slug}.briefSection.fields.contentAr` as never)}
                </FieldLabel>
                <Textarea
                  id="brief-content-ar"
                  className="min-h-32"
                  placeholder={t(
                    `${slug}.briefSection.placeholders.contentAr` as never
                  )}
                  {...form.getInputProps("contentAr")}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="brief-content-en">
                  {t(`${slug}.briefSection.fields.contentEn` as never)}
                </FieldLabel>
                <Textarea
                  id="brief-content-en"
                  className="min-h-32"
                  placeholder={t(
                    `${slug}.briefSection.placeholders.contentEn` as never
                  )}
                  {...form.getInputProps("contentEn")}
                />
              </Field>
            </div>

            <Field>
              <FieldDescription>
                {t(`${slug}.briefSection.ui.bilingualHint` as never)}
              </FieldDescription>
            </Field>
          </FieldGroup>
          {form.errors.root && (
            <FieldError errors={[{ message: String(form.errors.root) }]} />
          )}
          <Button type="submit" disabled={form.submitting}>
            {form.submitting && <Spinner data-icon="inline-start" />}
            {t(`${slug}.briefSection.save` as never)}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
