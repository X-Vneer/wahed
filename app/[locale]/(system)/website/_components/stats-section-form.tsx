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
import { Switch } from "@/components/ui/switch"
import { handleFormErrors } from "@/utils/handle-form-errors"

export type StatsSectionValues = {
  isActive: boolean
  firstValueAr: string
  firstValueEn: string
  firstLabelAr: string
  firstLabelEn: string
  secondValueAr: string
  secondValueEn: string
  secondLabelAr: string
  secondLabelEn: string
  thirdValueAr: string
  thirdValueEn: string
  thirdLabelAr: string
  thirdLabelEn: string
}

type StatsSectionFormProps = {
  slug: string
  onSubmit?: (payload: {
    slug: string
    values: StatsSectionValues
  }) => Promise<void> | void
  initialValues?: StatsSectionValues
}

const EMPTY_VALUES: StatsSectionValues = {
  isActive: false,
  firstValueAr: "",
  firstValueEn: "",
  firstLabelAr: "",
  firstLabelEn: "",
  secondValueAr: "",
  secondValueEn: "",
  secondLabelAr: "",
  secondLabelEn: "",
  thirdValueAr: "",
  thirdValueEn: "",
  thirdLabelAr: "",
  thirdLabelEn: "",
}

export function StatsSectionForm({
  slug,
  onSubmit,
  initialValues,
}: StatsSectionFormProps) {
  const t = useTranslations("websiteCms")

  const safeInitialValues: StatsSectionValues = {
    ...EMPTY_VALUES,
    ...initialValues,
  }

  const form = useForm<StatsSectionValues>({
    mode: "controlled",
    initialValues: safeInitialValues,
  })

  useEffect(() => {
    form.setValues(safeInitialValues)
  }, [JSON.stringify(initialValues)]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (values: StatsSectionValues) => {
    form.clearFieldError("root")

    try {
      if (!onSubmit) return
      await onSubmit({ slug, values })
      toast.success(t(`${slug}.statsSection.success.saved` as never))
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const rootError = handleFormErrors(error, form)
        const message =
          rootError || t(`${slug}.statsSection.errors.saveFailed` as never)
        form.setFieldError("root", message)
        toast.error(message)
        return
      }

      const message =
        (error as Error)?.message ||
        t(`${slug}.statsSection.errors.saveFailed` as never)
      form.setFieldError("root", message)
      toast.error(message)
    }
  }

  return (
    <Card className="border-border/70 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle>{t(`${slug}.statsSection.title` as never)}</CardTitle>
        <CardDescription>
          {t(`${slug}.statsSection.description` as never)}
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
                id="stats-is-active"
                checked={form.values.isActive}
                onCheckedChange={(checked) =>
                  form.setFieldValue("isActive", checked)
                }
              />
              <div className="flex flex-col gap-0.5">
                <FieldLabel
                  htmlFor="stats-is-active"
                  className="cursor-pointer"
                >
                  {t(`${slug}.statsSection.fields.isActive` as never)}
                </FieldLabel>
                <FieldDescription>
                  {t(`${slug}.statsSection.ui.isActiveHint` as never)}
                </FieldDescription>
              </div>
            </Field>

            {(["first", "second", "third"] as const).map((item) => (
              <div key={item} className="rounded-xl border p-4">
                <FieldDescription className="mb-4 font-medium">
                  {t(`${slug}.statsSection.items.${item}` as never)}
                </FieldDescription>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor={`${item}-value-ar`}>
                      {t(`${slug}.statsSection.fields.valueAr` as never)}
                    </FieldLabel>
                    <Input
                      id={`${item}-value-ar`}
                      placeholder={t(
                        `${slug}.statsSection.placeholders.${item}.valueAr` as never
                      )}
                      {...form.getInputProps(`${item}ValueAr`)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`${item}-value-en`}>
                      {t(`${slug}.statsSection.fields.valueEn` as never)}
                    </FieldLabel>
                    <Input
                      id={`${item}-value-en`}
                      placeholder={t(
                        `${slug}.statsSection.placeholders.${item}.valueEn` as never
                      )}
                      {...form.getInputProps(`${item}ValueEn`)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`${item}-label-ar`}>
                      {t(`${slug}.statsSection.fields.labelAr` as never)}
                    </FieldLabel>
                    <Input
                      id={`${item}-label-ar`}
                      placeholder={t(
                        `${slug}.statsSection.placeholders.${item}.labelAr` as never
                      )}
                      {...form.getInputProps(`${item}LabelAr`)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`${item}-label-en`}>
                      {t(`${slug}.statsSection.fields.labelEn` as never)}
                    </FieldLabel>
                    <Input
                      id={`${item}-label-en`}
                      placeholder={t(
                        `${slug}.statsSection.placeholders.${item}.labelEn` as never
                      )}
                      {...form.getInputProps(`${item}LabelEn`)}
                    />
                  </Field>
                </div>
              </div>
            ))}

            <Field>
              <FieldDescription>
                {t(`${slug}.statsSection.ui.bilingualHint` as never)}
              </FieldDescription>
            </Field>
          </FieldGroup>

          {form.errors.root && (
            <FieldError errors={[{ message: String(form.errors.root) }]} />
          )}

          <Button type="submit" disabled={form.submitting}>
            {form.submitting && <Spinner data-icon="inline-start" />}
            {t(`${slug}.statsSection.save` as never)}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
