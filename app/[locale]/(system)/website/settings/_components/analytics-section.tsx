"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { UseFormReturnType } from "@mantine/form"
import { Megaphone } from "lucide-react"
import { useTranslations } from "next-intl"
import type { FormModel } from "./form-model"

type Props = {
  form: UseFormReturnType<FormModel>
  isLoading: boolean
}

export function AnalyticsSection({ form, isLoading }: Props) {
  const t = useTranslations("websiteCms.settings")

  return (
    <Card className="border-border/70 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Megaphone className="text-muted-foreground size-5" />
          {t("contact.title")}
        </CardTitle>
        <CardDescription>{t("contact.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup className="flex flex-col gap-5">
          <Field data-invalid={!!form.errors.googleAnalyticsMeasurementId}>
            <FieldLabel htmlFor="ws-ga">{t("contact.gaId")}</FieldLabel>
            <FieldDescription>{t("contact.gaHint")}</FieldDescription>
            <FieldContent>
              <Input
                id="ws-ga"
                key={form.key("googleAnalyticsMeasurementId")}
                className="max-w-md font-mono text-sm"
                {...form.getInputProps("googleAnalyticsMeasurementId")}
                placeholder="G-XXXXXXXXXX"
                disabled={isLoading}
                aria-invalid={!!form.errors.googleAnalyticsMeasurementId}
              />
              {form.errors.googleAnalyticsMeasurementId ? (
                <FieldError>
                  {String(form.errors.googleAnalyticsMeasurementId)}
                </FieldError>
              ) : null}
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
