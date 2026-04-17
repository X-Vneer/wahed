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
import { Textarea } from "@/components/ui/textarea"
import type { UseFormReturnType } from "@mantine/form"
import { FileText } from "lucide-react"
import { useTranslations } from "next-intl"
import type { FormModel } from "./form-model"

type Props = {
  form: UseFormReturnType<FormModel>
  isLoading: boolean
}

export function FooterSection({ form, isLoading }: Props) {
  const t = useTranslations("websiteCms.settings")

  return (
    <Card className="border-border/70 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="text-muted-foreground size-5" />
          {t("footer.title")}
        </CardTitle>
        <CardDescription>{t("footer.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup className="grid gap-5 md:grid-cols-2">
          <Field data-invalid={!!form.errors.footerDescriptionAr}>
            <FieldLabel htmlFor="ws-footer-ar">
              {t("footer.descriptionAr")}
            </FieldLabel>
            <FieldContent>
              <Textarea
                id="ws-footer-ar"
                key={form.key("footerDescriptionAr")}
                {...form.getInputProps("footerDescriptionAr")}
                disabled={isLoading}
                rows={3}
                dir="rtl"
                aria-invalid={!!form.errors.footerDescriptionAr}
              />
              {form.errors.footerDescriptionAr ? (
                <FieldError>
                  {String(form.errors.footerDescriptionAr)}
                </FieldError>
              ) : null}
            </FieldContent>
          </Field>
          <Field data-invalid={!!form.errors.footerDescriptionEn}>
            <FieldLabel htmlFor="ws-footer-en">
              {t("footer.descriptionEn")}
            </FieldLabel>
            <FieldContent>
              <Textarea
                id="ws-footer-en"
                key={form.key("footerDescriptionEn")}
                {...form.getInputProps("footerDescriptionEn")}
                disabled={isLoading}
                rows={3}
                aria-invalid={!!form.errors.footerDescriptionEn}
              />
              {form.errors.footerDescriptionEn ? (
                <FieldError>
                  {String(form.errors.footerDescriptionEn)}
                </FieldError>
              ) : null}
            </FieldContent>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
