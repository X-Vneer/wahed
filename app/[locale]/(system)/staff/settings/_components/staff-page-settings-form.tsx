"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import Uploader from "@/components/uploader"
import {
  useStaffPageSettings,
  useUpdateStaffPageSettings,
} from "@/hooks/use-staff-page-settings"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { useForm } from "@mantine/form"
import { zod4Resolver } from "mantine-form-zod-resolver"
import { updateStaffPageSettingsSchema } from "@/lib/schemas/staff-page-settings"

export function StaffPageSettingsForm() {
  const t = useTranslations("staffPageSettings")
  const { data: settings, isLoading } = useStaffPageSettings()
  const updateMutation = useUpdateStaffPageSettings()

  const form = useForm({
    mode: "controlled",
    initialValues: {
      heroBackgroundImageUrl: "" as string | null,
      attendanceLink: "/attendance",
      accountingLink: "/accounting",
    },
    validate: zod4Resolver(updateStaffPageSettingsSchema),
  })

  useEffect(() => {
    if (settings) {
      form.setValues({
        heroBackgroundImageUrl: settings.heroBackgroundImageUrl ?? "",
        attendanceLink: settings.attendanceLink,
        accountingLink: settings.accountingLink,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(settings)])

  const handleSubmit = (values: typeof form.values) => {
    updateMutation.mutate({
      heroBackgroundImageUrl:
        values.heroBackgroundImageUrl === ""
          ? null
          : (values.heroBackgroundImageUrl ?? undefined),
      attendanceLink: values.attendanceLink,
      accountingLink: values.accountingLink,
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="size-8" />
      </div>
    )
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FieldGroup>
            <FieldLabel>{t("heroBackground")}</FieldLabel>
            <p className="text-muted-foreground mb-2 text-sm">
              {t("heroBackgroundDescription")}
            </p>
            {form.values.heroBackgroundImageUrl ? (
              <div className="space-y-2">
                <div className="bg-muted relative h-72 w-full overflow-hidden rounded-lg border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.values.heroBackgroundImageUrl}
                    alt="Hero background preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      form.setFieldValue("heroBackgroundImageUrl", "")
                    }
                  >
                    {t("clearImage")}
                  </Button>
                </div>
              </div>
            ) : (
              <Uploader
                endpoint="staffHeroImageUploader"
                onClientUploadComplete={(res) => {
                  if (res && res.length > 0) {
                    form.setFieldValue("heroBackgroundImageUrl", res[0].ufsUrl)
                  }
                }}
              />
            )}
            <FieldError>{form.errors.heroBackgroundImageUrl}</FieldError>
          </FieldGroup>

          <Field>
            <FieldLabel>{t("attendanceLink")}</FieldLabel>
            <Input
              type="url"
              key={form.key("attendanceLink")}
              {...form.getInputProps("attendanceLink")}
              placeholder={t("attendanceLinkPlaceholder")}
            />
            <FieldError>{form.errors.attendanceLink}</FieldError>
          </Field>

          <Field>
            <FieldLabel>{t("accountingLink")}</FieldLabel>
            <Input
              type="url"
              key={form.key("accountingLink")}
              {...form.getInputProps("accountingLink")}
              placeholder={t("accountingLinkPlaceholder")}
            />
            <FieldError>{form.errors.accountingLink}</FieldError>
          </Field>

          <Button
            type="submit"
            className="px-10"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <Spinner className="size-4" />
            ) : (
              t("save")
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
