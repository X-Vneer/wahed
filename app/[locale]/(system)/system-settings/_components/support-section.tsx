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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { UseFormReturnType } from "@mantine/form"
import { LifeBuoy } from "lucide-react"
import { useTranslations } from "next-intl"
import type { FormModel } from "./form-model"

type Props = {
  form: UseFormReturnType<FormModel>
  isLoading: boolean
}

export function SupportSection({ form, isLoading }: Props) {
  const t = useTranslations("systemSettings")

  return (
    <Card className="border-border/70 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <LifeBuoy className="text-muted-foreground size-5" />
          {t("support.title")}
        </CardTitle>
        <CardDescription>{t("support.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup className="grid gap-5 md:grid-cols-2">
          <Field data-invalid={!!form.errors.supportEmail}>
            <FieldLabel htmlFor="sys-support-email">
              {t("support.email")}
            </FieldLabel>
            <FieldContent>
              <Input
                id="sys-support-email"
                dir="ltr"
                type="email"
                key={form.key("supportEmail")}
                {...form.getInputProps("supportEmail")}
                placeholder="support@example.com"
                disabled={isLoading}
                aria-invalid={!!form.errors.supportEmail}
              />
              {form.errors.supportEmail ? (
                <FieldError>{String(form.errors.supportEmail)}</FieldError>
              ) : null}
            </FieldContent>
          </Field>

          <Field data-invalid={!!form.errors.supportPhone}>
            <FieldLabel htmlFor="sys-support-phone">
              {t("support.phone")}
            </FieldLabel>
            <FieldContent>
              <Input
                id="sys-support-phone"
                dir="ltr"
                key={form.key("supportPhone")}
                {...form.getInputProps("supportPhone")}
                placeholder="+966 ..."
                disabled={isLoading}
                aria-invalid={!!form.errors.supportPhone}
              />
              {form.errors.supportPhone ? (
                <FieldError>{String(form.errors.supportPhone)}</FieldError>
              ) : null}
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
