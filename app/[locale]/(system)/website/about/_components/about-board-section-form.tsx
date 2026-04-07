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
import Uploader from "@/components/uploader"

export type AboutBoardSectionValues = {
  isActive: boolean
  eyebrowTitleAr: string
  eyebrowTitleEn: string
  titleAr: string
  titleEn: string
  members: string[]
}

type AboutBoardSectionFormProps = {
  slug: string
  onSubmit?: (payload: {
    slug: string
    values: AboutBoardSectionValues
  }) => Promise<void> | void
  initialValues?: AboutBoardSectionValues
}

export function AboutBoardSectionForm({
  slug,
  onSubmit,
  initialValues,
}: AboutBoardSectionFormProps) {
  const t = useTranslations("websiteCms")
  const safeInitialValues: AboutBoardSectionValues = {
    isActive: initialValues?.isActive ?? false,
    eyebrowTitleAr: initialValues?.eyebrowTitleAr ?? "",
    eyebrowTitleEn: initialValues?.eyebrowTitleEn ?? "",
    titleAr: initialValues?.titleAr ?? "",
    titleEn: initialValues?.titleEn ?? "",
    members: initialValues?.members ?? [],
  }

  const form = useForm<AboutBoardSectionValues>({
    mode: "controlled",
    initialValues: safeInitialValues,
  })

  useEffect(() => {
    form.setValues(safeInitialValues)
  }, [JSON.stringify(initialValues)]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (values: AboutBoardSectionValues) => {
    form.clearFieldError("root")

    try {
      if (!onSubmit) return
      await onSubmit({ slug, values })
      toast.success(t(`${slug}.boardSection.success.saved` as never))
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const rootError = handleFormErrors(error, form)
        const message =
          rootError || t(`${slug}.boardSection.errors.saveFailed` as never)
        form.setFieldError("root", message)
        toast.error(message)
        return
      }

      const message =
        (error as Error)?.message ||
        t(`${slug}.boardSection.errors.saveFailed` as never)
      form.setFieldError("root", message)
      toast.error(message)
    }
  }

  const removeMemberByIndex = (index: number) => {
    form.setFieldValue(
      "members",
      form.values.members.filter((_, memberIndex) => memberIndex !== index)
    )
  }

  return (
    <Card className="border-border/70 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle>{t(`${slug}.boardSection.title` as never)}</CardTitle>
        <CardDescription>
          {t(`${slug}.boardSection.description` as never)}
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
                id="about-board-is-active"
                checked={form.values.isActive}
                onCheckedChange={(checked) =>
                  form.setFieldValue("isActive", checked)
                }
              />
              <div className="flex flex-col gap-0.5">
                <FieldLabel
                  htmlFor="about-board-is-active"
                  className="cursor-pointer"
                >
                  {t(`${slug}.boardSection.fields.isActive` as never)}
                </FieldLabel>
                <FieldDescription>
                  {t(`${slug}.boardSection.ui.isActiveHint` as never)}
                </FieldDescription>
              </div>
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="about-board-eyebrow-ar">
                  {t(`${slug}.boardSection.fields.eyebrowTitleAr` as never)}
                </FieldLabel>
                <Input
                  id="about-board-eyebrow-ar"
                  placeholder={t(
                    `${slug}.boardSection.placeholders.eyebrowTitleAr` as never
                  )}
                  {...form.getInputProps("eyebrowTitleAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="about-board-eyebrow-en">
                  {t(`${slug}.boardSection.fields.eyebrowTitleEn` as never)}
                </FieldLabel>
                <Input
                  id="about-board-eyebrow-en"
                  placeholder={t(
                    `${slug}.boardSection.placeholders.eyebrowTitleEn` as never
                  )}
                  {...form.getInputProps("eyebrowTitleEn")}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="about-board-title-ar">
                  {t(`${slug}.boardSection.fields.titleAr` as never)}
                </FieldLabel>
                <Input
                  id="about-board-title-ar"
                  placeholder={t(
                    `${slug}.boardSection.placeholders.titleAr` as never
                  )}
                  {...form.getInputProps("titleAr")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="about-board-title-en">
                  {t(`${slug}.boardSection.fields.titleEn` as never)}
                </FieldLabel>
                <Input
                  id="about-board-title-en"
                  placeholder={t(
                    `${slug}.boardSection.placeholders.titleEn` as never
                  )}
                  {...form.getInputProps("titleEn")}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel>
                {t(`${slug}.boardSection.fields.members` as never)}
              </FieldLabel>
              <FieldDescription>
                {t(`${slug}.boardSection.ui.membersHint` as never)}
              </FieldDescription>
              <div className="bg-muted/40 mt-2 rounded-xl border border-dashed p-4">
                <Uploader
                  endpoint="websiteMultiImageUploader"
                  onClientUploadComplete={(res) => {
                    if (res && res.length > 0) {
                      const uploadedUrls = res.map((file) => file.ufsUrl)
                      const uniqueMembers = Array.from(
                        new Set([...form.values.members, ...uploadedUrls])
                      )
                      form.setFieldValue("members", uniqueMembers)
                    }
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(error.message || "Upload failed")
                  }}
                />
              </div>
            </Field>

            {form.values.members.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {form.values.members.map((member, index) => (
                  <div
                    key={`${member}-${index}`}
                    className="bg-muted/20 flex flex-col gap-2 rounded-xl border p-2"
                  >
                    <div className="bg-background relative h-40 overflow-hidden rounded-lg border">
                      <img
                        src={member}
                        alt={`${t(`${slug}.boardSection.fields.members` as never)} ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <Button
                        size="icon"
                        className="absolute top-1 right-1 h-7 w-7"
                        variant="destructive"
                        type="button"
                        onClick={() => removeMemberByIndex(index)}
                        aria-label={t(
                          `${slug}.boardSection.ui.removeMember` as never
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
                {t(`${slug}.boardSection.ui.noMembers` as never)}
              </p>
            )}

            <Field>
              <FieldDescription>
                {t(`${slug}.boardSection.ui.bilingualHint` as never)}
              </FieldDescription>
            </Field>
          </FieldGroup>
          {form.errors.root && (
            <FieldError errors={[{ message: String(form.errors.root) }]} />
          )}
          <Button type="submit" disabled={form.submitting}>
            {form.submitting && <Spinner data-icon="inline-start" />}
            {t(`${slug}.boardSection.save` as never)}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
