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
import { Palette } from "lucide-react"
import { useTranslations } from "next-intl"
import type { FormModel } from "./form-model"

type Props = {
  form: UseFormReturnType<FormModel>
  isLoading: boolean
}

type ColorField = {
  name: "primaryColor" | "accentColor" | "blackColor" | "secondaryTextColor"
  labelKey: "primaryColor" | "accentColor" | "blackColor" | "secondaryTextColor"
  id: string
  placeholder: string
}

const COLOR_FIELDS: ColorField[] = [
  {
    name: "primaryColor",
    labelKey: "primaryColor",
    id: "ws-primary",
    placeholder: "#0f172a",
  },
  {
    name: "accentColor",
    labelKey: "accentColor",
    id: "ws-accent",
    placeholder: "#2563eb",
  },
  {
    name: "blackColor",
    labelKey: "blackColor",
    id: "ws-black",
    placeholder: "#000000",
  },
  {
    name: "secondaryTextColor",
    labelKey: "secondaryTextColor",
    id: "ws-secondary-text",
    placeholder: "#64748b",
  },
]

export function ThemeSection({ form, isLoading }: Props) {
  const t = useTranslations("websiteCms.settings")

  return (
    <Card className="border-border/70 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Palette className="text-muted-foreground size-5" />
          {t("theme.title")}
        </CardTitle>
        <CardDescription>{t("theme.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup className="grid gap-5 md:grid-cols-2">
          {COLOR_FIELDS.map((f) => {
            const error = form.errors[f.name]
            const value = form.values[f.name]
            return (
              <Field key={f.name} data-invalid={!!error}>
                <FieldLabel htmlFor={f.id}>
                  {t(`theme.${f.labelKey}`)}
                </FieldLabel>
                <FieldContent>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Input
                      dir="ltr"
                      id={f.id}
                      key={form.key(f.name)}
                      {...form.getInputProps(f.name)}
                      placeholder={f.placeholder}
                      disabled={isLoading}
                      className="font-mono"
                      aria-invalid={!!error}
                    />
                    {value ? (
                      <span
                        className="border-input size-10 shrink-0 rounded-md border shadow-inner"
                        style={{ backgroundColor: value }}
                        aria-hidden
                      />
                    ) : null}
                  </div>
                  {error ? <FieldError>{String(error)}</FieldError> : null}
                </FieldContent>
              </Field>
            )
          })}
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
