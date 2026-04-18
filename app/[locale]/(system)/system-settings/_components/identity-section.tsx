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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { UseFormReturnType } from "@mantine/form"
import { Building2 } from "lucide-react"
import { useTranslations } from "next-intl"
import type { FormModel } from "./form-model"

type Props = {
  form: UseFormReturnType<FormModel>
  isLoading: boolean
}

export function IdentitySection({ form, isLoading }: Props) {
  const t = useTranslations("systemSettings")

  return (
    <Card className="border-border/70 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="text-muted-foreground size-5" />
          {t("identity.title")}
        </CardTitle>
        <CardDescription>{t("identity.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup className="grid gap-5 md:grid-cols-2">
          <Field data-invalid={!!form.errors.systemNameAr}>
            <FieldLabel htmlFor="sys-name-ar">
              {t("identity.systemNameAr")}
            </FieldLabel>
            <FieldContent>
              <Input
                id="sys-name-ar"
                key={form.key("systemNameAr")}
                {...form.getInputProps("systemNameAr")}
                disabled={isLoading}
                dir="rtl"
                aria-invalid={!!form.errors.systemNameAr}
              />
              {form.errors.systemNameAr ? (
                <FieldError>{String(form.errors.systemNameAr)}</FieldError>
              ) : null}
            </FieldContent>
          </Field>

          <Field data-invalid={!!form.errors.systemNameEn}>
            <FieldLabel htmlFor="sys-name-en">
              {t("identity.systemNameEn")}
            </FieldLabel>
            <FieldContent>
              <Input
                id="sys-name-en"
                key={form.key("systemNameEn")}
                {...form.getInputProps("systemNameEn")}
                disabled={isLoading}
                aria-invalid={!!form.errors.systemNameEn}
              />
              {form.errors.systemNameEn ? (
                <FieldError>{String(form.errors.systemNameEn)}</FieldError>
              ) : null}
            </FieldContent>
          </Field>

          <Field data-invalid={!!form.errors.defaultLocale}>
            <FieldLabel htmlFor="sys-default-locale">
              {t("identity.defaultLocale")}
            </FieldLabel>
            <FieldContent>
              <Select
                value={form.values.defaultLocale}
                onValueChange={(value) => {
                  if (value === "ar" || value === "en") {
                    form.setFieldValue("defaultLocale", value)
                  }
                }}
              >
                <SelectTrigger
                  id="sys-default-locale"
                  className="w-full"
                  disabled={isLoading}
                >
                  <SelectValue>
                    {t(`identity.locales.${form.values.defaultLocale}`)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">
                    {t("identity.locales.en")}
                  </SelectItem>
                  <SelectItem value="ar">
                    {t("identity.locales.ar")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>

          <Field data-invalid={!!form.errors.sidebarVariant}>
            <FieldLabel htmlFor="sys-sidebar-variant">
              {t("identity.sidebarVariant")}
            </FieldLabel>
            <FieldContent>
              <Select
                value={form.values.sidebarVariant}
                onValueChange={(value) => {
                  if (value === "light" || value === "dark") {
                    form.setFieldValue("sidebarVariant", value)
                  }
                }}
              >
                <SelectTrigger
                  id="sys-sidebar-variant"
                  className="w-full"
                  disabled={isLoading}
                >
                  <SelectValue>
                    {t(`identity.variants.${form.values.sidebarVariant}`)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    {t("identity.variants.light")}
                  </SelectItem>
                  <SelectItem value="dark">
                    {t("identity.variants.dark")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
